from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from datetime import datetime, timedelta
from ..extensions import db
from ..utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def admin_dashboard():
    """Admin dashboard statistics"""
    
    # Get various stats
    stats = {}
    
    # Total users
    result = db.session.execute(text("SELECT COUNT(*) as total FROM users WHERE is_active = TRUE"))
    stats['total_users'] = result.first()[0]
    
    # Total books
    result = db.session.execute(text("SELECT COUNT(*) as total FROM books WHERE is_archived = FALSE"))
    stats['total_books'] = result.first()[0]
    
    # Active borrowings
    result = db.session.execute(
        text("SELECT COUNT(*) as total FROM borrowings WHERE status NOT IN ('returned', 'lost')")
    )
    stats['active_borrowings'] = result.first()[0]
    
    # Overdue borrowings
    result = db.session.execute(
        text("SELECT COUNT(*) as total FROM borrowings WHERE due_date < CURDATE() AND status NOT IN ('returned', 'lost')")
    )
    stats['overdue_borrowings'] = result.first()[0]
    
    # Pending memberships
    result = db.session.execute(
        text("SELECT COUNT(*) as total FROM memberships WHERE status = 'pending'")
    )
    stats['pending_memberships'] = result.first()[0]
    
    # Pending renewals
    result = db.session.execute(
        text("SELECT COUNT(*) as total FROM borrowings WHERE renewal_requested = TRUE AND renewal_status = 'pending'")
    )
    stats['pending_renewals'] = result.first()[0]
    
    # Total revenue from fines (last 30 days)
    result = db.session.execute(
        text("""
            SELECT SUM(fine_amount) as total 
            FROM borrow_history 
            WHERE fine_status = 'paid' AND returned_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        """)
    )
    stats['revenue_last_30_days'] = float(result.first()[0] or 0)
    
    return jsonify(stats), 200


@admin_bp.route('/books', methods=['POST'])
@jwt_required()
@admin_required
def add_book():
    """Add a new book"""
    data = request.get_json()
    admin_id = int(get_jwt_identity())
    
    # Validate required fields
    if not data.get('title') or not data.get('author'):
        return jsonify({'error': 'Title and author are required'}), 400
    
    # Insert book
    result = db.session.execute(
        text("""
            INSERT INTO books (title, author, isbn, genre, publisher, published_year, 
                             language, total_copies, available_copies, description, added_by)
            VALUES (:title, :author, :isbn, :genre, :publisher, :published_year,
                    :language, :total_copies, :total_copies, :description, :added_by)
        """),
        {
            'title': data['title'],
            'author': data['author'],
            'isbn': data.get('isbn'),
            'genre': data.get('genre'),
            'publisher': data.get('publisher'),
            'published_year': data.get('published_year'),
            'language': data.get('language', 'English'),
            'total_copies': data.get('total_copies', 1),
            'description': data.get('description'),
            'added_by': admin_id
        }
    )
    db.session.commit()
    
    return jsonify({'message': 'Book added successfully', 'book_id': result.lastrowid}), 201


@admin_bp.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_book(book_id):
    """Update book details"""
    data = request.get_json()
    
    updates = []
    params = {'book_id': book_id}
    
    updatable_fields = ['title', 'author', 'isbn', 'genre', 'publisher', 
                       'published_year', 'language', 'total_copies', 'description']
    
    for field in updatable_fields:
        if field in data:
            updates.append(f"{field} = :{field}")
            params[field] = data[field]
    
    if updates:
        query = f"UPDATE books SET {', '.join(updates)}, updated_at = NOW() WHERE book_id = :book_id"
        db.session.execute(text(query), params)
        db.session.commit()
    
    return jsonify({'message': 'Book updated successfully'}), 200


@admin_bp.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def archive_book(book_id):
    """Archive a book (soft delete)"""
    db.session.execute(
        text("UPDATE books SET is_archived = TRUE WHERE book_id = :book_id"),
        {'book_id': book_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Book archived successfully'}), 200


@admin_bp.route('/memberships/pending', methods=['GET'])
@jwt_required()
@admin_required
def get_pending_memberships():
    """Get all pending membership requests"""
    result = db.session.execute(
        text("""
            SELECT m.*, u.full_name, u.email, u.phone
            FROM memberships m
            JOIN users u ON m.user_id = u.user_id
            WHERE m.status = 'pending'
            ORDER BY m.requested_at ASC
        """)
    )
    memberships = [dict(row._mapping) for row in result]
    
    return jsonify(memberships), 200


@admin_bp.route('/memberships/<int:membership_id>/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_membership(membership_id):
    """Approve a membership request"""
    admin_id = int(get_jwt_identity())
    data = request.get_json()
    
    duration_months = data.get('duration_months', 12)
    
    # Generate card number
    card_number = f"LIB-{datetime.now().strftime('%Y%m%d')}-{membership_id}"
    
    # Update membership
    db.session.execute(
        text("""
            UPDATE memberships 
            SET status = 'active',
                approved_at = NOW(),
                start_date = CURDATE(),
                expiry_date = DATE_ADD(CURDATE(), INTERVAL :duration_months MONTH),
                processed_by = :admin_id,
                payment_status = 'paid',
                card_number = :card_number,
                card_issued_at = NOW()
            WHERE membership_id = :membership_id
        """),
        {
            'duration_months': duration_months,
            'admin_id': admin_id,
            'card_number': card_number,
            'membership_id': membership_id
        }
    )
    db.session.commit()
    
    return jsonify({'message': 'Membership approved', 'card_number': card_number}), 200


@admin_bp.route('/memberships/<int:membership_id>/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_membership(membership_id):
    """Reject a membership request"""
    admin_id = int(get_jwt_identity())
    
    db.session.execute(
        text("""
            UPDATE memberships 
            SET status = 'rejected', processed_by = :admin_id
            WHERE membership_id = :membership_id
        """),
        {'admin_id': admin_id, 'membership_id': membership_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Membership rejected'}), 200


@admin_bp.route('/borrowings', methods=['GET'])
@jwt_required()
@admin_required
def get_all_borrowings():
    """Get all active borrowings (admin view)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    
    query = """
        SELECT b.*, u.full_name as user_name, u.email, bk.title as book_title
        FROM borrowings b
        JOIN users u ON b.user_id = u.user_id
        JOIN books bk ON b.book_id = bk.book_id
        WHERE 1=1
    """
    params = {}
    
    if status:
        query += " AND b.status = :status"
        params['status'] = status
    
    query += " ORDER BY b.due_date ASC LIMIT :limit OFFSET :offset"
    params['limit'] = per_page
    params['offset'] = (page - 1) * per_page
    
    result = db.session.execute(text(query), params)
    borrowings = [dict(row._mapping) for row in result]
    
    return jsonify(borrowings), 200


@admin_bp.route('/borrowings/<int:borrow_id>/renew/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_renewal(borrow_id):
    """Approve a renewal request"""
    admin_id = int(get_jwt_identity())
    
    # Get current borrow record
    result = db.session.execute(
        text("SELECT * FROM borrowings WHERE borrow_id = :borrow_id"),
        {'borrow_id': borrow_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'Borrow record not found'}), 404
    
    # Calculate new due date (extend by 14 days)
    new_due_date = datetime.now() + timedelta(days=14)
    
    # Update borrow record
    db.session.execute(
        text("""
            UPDATE borrowings 
            SET renewal_count = renewal_count + 1,
                renewal_requested = FALSE,
                renewal_status = 'approved',
                due_date = :new_due_date,
                status = 'renewed',
                updated_at = NOW()
            WHERE borrow_id = :borrow_id
        """),
        {'borrow_id': borrow_id, 'new_due_date': new_due_date.date()}
    )
    db.session.commit()
    
    return jsonify({'message': 'Renewal approved', 'new_due_date': new_due_date.date()}), 200


@admin_bp.route('/borrowings/<int:borrow_id>/renew/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_renewal(borrow_id):
    """Reject a renewal request"""
    admin_id = int(get_jwt_identity())
    
    db.session.execute(
        text("""
            UPDATE borrowings 
            SET renewal_requested = FALSE,
                renewal_status = 'rejected',
                updated_at = NOW()
            WHERE borrow_id = :borrow_id
        """),
        {'borrow_id': borrow_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Renewal rejected'}), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users (admin view)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search')
    
    query = """
        SELECT u.*, 
               (SELECT COUNT(*) FROM borrowings b WHERE b.user_id = u.user_id AND b.status NOT IN ('returned', 'lost')) as active_borrows
        FROM users u
        WHERE 1=1
    """
    params = {}
    
    if search:
        query += " AND (u.full_name LIKE :search OR u.email LIKE :search)"
        params['search'] = f'%{search}%'
    
    query += " ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset"
    params['limit'] = per_page
    params['offset'] = (page - 1) * per_page
    
    result = db.session.execute(text(query), params)
    users = [dict(row._mapping) for row in result]
    
    return jsonify(users), 200


@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@jwt_required()
@admin_required
def deactivate_user(user_id):
    """Deactivate a user account"""
    db.session.execute(
        text("UPDATE users SET is_active = FALSE WHERE user_id = :user_id"),
        {'user_id': user_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'User deactivated successfully'}), 200


@admin_bp.route('/stats/borrowings', methods=['GET'])
@jwt_required()
@admin_required
def get_borrowing_stats():
    """Get borrowing statistics"""
    result = db.session.execute(
        text("""
            SELECT 
                DATE(issued_at) as date,
                COUNT(*) as count
            FROM borrowings
            WHERE issued_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(issued_at)
            ORDER BY date ASC
        """)
    )
    stats = [dict(row._mapping) for row in result]
    
    return jsonify(stats), 200