from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from ..extensions import db

books_bp = Blueprint('books', __name__)


@books_bp.route('', methods=['GET'])
def get_books():
    """Get all books from vw_book_catalogue"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    genre = request.args.get('genre')
    search = request.args.get('search')
    available_only = request.args.get('available_only', 'false').lower() == 'true'
    
    query = "SELECT * FROM vw_book_catalogue WHERE 1=1"
    params = {}
    
    if genre:
        query += " AND genre = :genre"
        params['genre'] = genre
    
    if search:
        query += " AND (title LIKE :search OR author LIKE :search OR genre LIKE :search)"
        params['search'] = f'%{search}%'
    
    if available_only:
        query += " AND available_copies > 0"
    
    query += " ORDER BY book_id LIMIT :limit OFFSET :offset"
    params['limit'] = per_page
    params['offset'] = (page - 1) * per_page
    
    result = db.session.execute(text(query), params)
    books = [dict(row._mapping) for row in result]
    
    # Get total count
    count_query = "SELECT COUNT(*) as total FROM vw_book_catalogue WHERE 1=1"
    count_params = {}
    
    if genre:
        count_query += " AND genre = :genre"
        count_params['genre'] = genre
    
    if search:
        count_query += " AND (title LIKE :search OR author LIKE :search OR genre LIKE :search)"
        count_params['search'] = f'%{search}%'
    
    if available_only:
        count_query += " AND available_copies > 0"
    
    total_result = db.session.execute(text(count_query), count_params).first()
    total = total_result[0] if total_result else 0
    
    return jsonify({
        'books': books,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    }), 200


@books_bp.route('/genres', methods=['GET'])
def get_genres():
    """Get all unique genres"""
    result = db.session.execute(
        text("SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND is_archived = FALSE ORDER BY genre")
    )
    genres = [row[0] for row in result]
    return jsonify(genres), 200


@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get single book from vw_book_catalogue with reviews"""
    result = db.session.execute(
        text("SELECT * FROM vw_book_catalogue WHERE book_id = :book_id"),
        {'book_id': book_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'Book not found'}), 404
    
    # Get reviews for this book with user names
    reviews = db.session.execute(
        text("""
            SELECT r.*, u.full_name, u.profile_picture
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.book_id = :book_id 
            ORDER BY r.created_at DESC
        """),
        {'book_id': book_id}
    ).fetchall()
    
    return jsonify({
        'book': dict(result._mapping),
        'reviews': [dict(r._mapping) for r in reviews]
    }), 200


@books_bp.route('/<int:book_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(book_id):
    """Add a review for a book (requires authentication)"""
    data = request.get_json()
    user_id = int(get_jwt_identity())
    rating = data.get('rating')
    review_text = data.get('review_text')
    
    if not rating or rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    if not review_text or not review_text.strip():
        return jsonify({'error': 'Review text is required'}), 400
    
    # Check if book exists
    book = db.session.execute(
        text("SELECT book_id FROM books WHERE book_id = :book_id"),
        {'book_id': book_id}
    ).first()
    
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    # Check if user has borrowed this book (must have history to review)
    has_borrowed = db.session.execute(
        text("""
            SELECT 1 FROM borrow_history 
            WHERE user_id = :user_id AND book_id = :book_id 
            LIMIT 1
        """),
        {'user_id': user_id, 'book_id': book_id}
    ).first()
    
    if not has_borrowed:
        return jsonify({'error': 'You can only review books you have borrowed'}), 403
    
    # Check if user already reviewed this book
    existing = db.session.execute(
        text("SELECT review_id FROM reviews WHERE user_id = :user_id AND book_id = :book_id"),
        {'user_id': user_id, 'book_id': book_id}
    ).first()
    
    if existing:
        return jsonify({'error': 'You have already reviewed this book'}), 409
    
    # Insert review
    db.session.execute(
        text("""
            INSERT INTO reviews (user_id, book_id, rating, review_text)
            VALUES (:user_id, :book_id, :rating, :review_text)
        """),
        {'user_id': user_id, 'book_id': book_id, 'rating': rating, 'review_text': review_text}
    )
    db.session.commit()
    
    return jsonify({'message': 'Review added successfully'}), 201


@books_bp.route('/<int:book_id>/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(book_id, review_id):
    """Update user's own review"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Check if review belongs to user
    review = db.session.execute(
        text("""
            SELECT review_id FROM reviews 
            WHERE review_id = :review_id AND user_id = :user_id AND book_id = :book_id
        """),
        {'review_id': review_id, 'user_id': user_id, 'book_id': book_id}
    ).first()
    
    if not review:
        return jsonify({'error': 'Review not found or unauthorized'}), 404
    
    rating = data.get('rating')
    review_text = data.get('review_text')
    
    if rating and (rating < 1 or rating > 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    # Update review
    updates = []
    params = {'review_id': review_id}
    
    if rating:
        updates.append("rating = :rating")
        params['rating'] = rating
    
    if review_text:
        updates.append("review_text = :review_text")
        params['review_text'] = review_text
    
    if updates:
        query = f"UPDATE reviews SET {', '.join(updates)} WHERE review_id = :review_id"
        db.session.execute(text(query), params)
        db.session.commit()
    
    return jsonify({'message': 'Review updated successfully'}), 200


@books_bp.route('/<int:book_id>/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(book_id, review_id):
    """Delete user's own review"""
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("""
            DELETE FROM reviews 
            WHERE review_id = :review_id AND user_id = :user_id AND book_id = :book_id
        """),
        {'review_id': review_id, 'user_id': user_id, 'book_id': book_id}
    )
    db.session.commit()
    
    if result.rowcount == 0:
        return jsonify({'error': 'Review not found or unauthorized'}), 404
    
    return jsonify({'message': 'Review deleted successfully'}), 200