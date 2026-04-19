from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from ..extensions import db
import bcrypt

users_bp = Blueprint('users', __name__)


@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT * FROM vw_member_summary WHERE user_id = :user_id"),
        {'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(dict(result._mapping)), 200


@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_my_profile():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    updates = []
    params = {'user_id': user_id}
    
    if 'full_name' in data:
        updates.append("full_name = :full_name")
        params['full_name'] = data['full_name']
    
    if 'phone' in data:
        updates.append("phone = :phone")
        params['phone'] = data['phone']
    
    if 'address' in data:
        updates.append("address = :address")
        params['address'] = data['address']
    
    if updates:
        query = f"UPDATE users SET {', '.join(updates)}, updated_at = NOW() WHERE user_id = :user_id"
        db.session.execute(text(query), params)
        db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully'}), 200


@users_bp.route('/me/borrowings', methods=['GET'])
@jwt_required()
def get_my_borrowings():
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT * FROM vw_active_borrowings WHERE user_id = :user_id"),
        {'user_id': user_id}
    )
    borrowings = [dict(row._mapping) for row in result]
    
    return jsonify(borrowings), 200


@users_bp.route('/me/history', methods=['GET'])
@jwt_required()
def get_my_history():
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT * FROM vw_borrow_history WHERE user_id = :user_id"),
        {'user_id': user_id}
    )
    history = [dict(row._mapping) for row in result]
    
    return jsonify(history), 200


@users_bp.route('/me/wishlist', methods=['GET'])
@jwt_required()
def get_my_wishlist():
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("""
            SELECT b.*, w.added_at,
                   ROUND(IFNULL(AVG(r.rating), 0), 1) as avg_rating
            FROM wishlist w
            JOIN books b ON w.book_id = b.book_id
            LEFT JOIN reviews r ON b.book_id = r.book_id
            WHERE w.user_id = :user_id AND b.is_archived = FALSE
            GROUP BY b.book_id, w.added_at
            ORDER BY w.added_at DESC
        """),
        {'user_id': user_id}
    )
    wishlist = [dict(row._mapping) for row in result]
    
    return jsonify(wishlist), 200


@users_bp.route('/me/wishlist/<int:book_id>', methods=['POST'])
@jwt_required()
def add_to_wishlist(book_id):
    user_id = int(get_jwt_identity())
    
    # Check if book exists
    book = db.session.execute(
        text("SELECT book_id FROM books WHERE book_id = :book_id AND is_archived = FALSE"),
        {'book_id': book_id}
    ).first()
    
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    # Check if already in wishlist
    existing = db.session.execute(
        text("SELECT wishlist_id FROM wishlist WHERE user_id = :user_id AND book_id = :book_id"),
        {'user_id': user_id, 'book_id': book_id}
    ).first()
    
    if existing:
        return jsonify({'error': 'Book already in wishlist'}), 409
    
    # Add to wishlist
    db.session.execute(
        text("INSERT INTO wishlist (user_id, book_id) VALUES (:user_id, :book_id)"),
        {'user_id': user_id, 'book_id': book_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Added to wishlist'}), 201


@users_bp.route('/me/wishlist/<int:book_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(book_id):
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("DELETE FROM wishlist WHERE user_id = :user_id AND book_id = :book_id"),
        {'user_id': user_id, 'book_id': book_id}
    )
    db.session.commit()
    
    if result.rowcount == 0:
        return jsonify({'error': 'Book not in wishlist'}), 404
    
    return jsonify({'message': 'Removed from wishlist'}), 200


@users_bp.route('/me/notifications', methods=['GET'])
@jwt_required()
def get_my_notifications():
    user_id = int(get_jwt_identity())
    try:
        result = db.session.execute(
            text("SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 50"),
            {'user_id': user_id}
        )
        notifications = [dict(row._mapping) for row in result]
        return jsonify(notifications), 200
    except Exception:
        return jsonify([]), 200


@users_bp.route('/me/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    user_id = int(get_jwt_identity())
    try:
        db.session.execute(
            text("UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id"),
            {'user_id': user_id}
        )
        db.session.commit()
    except Exception:
        pass
    return jsonify({'message': 'All notifications marked as read'}), 200


@users_bp.route('/me/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = int(get_jwt_identity())
    try:
        db.session.execute(
            text("UPDATE notifications SET is_read = TRUE WHERE notification_id = :nid AND user_id = :user_id"),
            {'nid': notification_id, 'user_id': user_id}
        )
        db.session.commit()
    except Exception:
        pass
    return jsonify({'message': 'Notification marked as read'}), 200


@users_bp.route('/me/reservations', methods=['GET'])
@jwt_required()
def get_my_reservations():
    user_id = int(get_jwt_identity())
    result = db.session.execute(
        text("""
            SELECT r.reservation_id, r.book_id, r.reserved_at, r.expires_at, r.status,
                   b.title, b.author, b.cover_image, b.available_copies, b.total_copies
            FROM reservations r
            JOIN books b ON r.book_id = b.book_id
            WHERE r.user_id = :user_id AND r.status = 'pending'
            ORDER BY r.reserved_at DESC
        """),
        {'user_id': user_id}
    )
    reservations = [dict(row._mapping) for row in result]
    return jsonify(reservations), 200


@users_bp.route('/me/reservations', methods=['POST'])
@jwt_required()
def create_reservation():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    book_id = data.get('book_id')

    if not book_id:
        return jsonify({'error': 'book_id is required'}), 400

    book = db.session.execute(
        text("SELECT book_id, available_copies FROM books WHERE book_id = :book_id AND is_archived = FALSE"),
        {'book_id': book_id}
    ).first()

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book['available_copies'] <= 0:
        return jsonify({'error': 'No copies available for reservation'}), 409

    existing = db.session.execute(
        text("""
            SELECT reservation_id FROM reservations
            WHERE user_id = :user_id AND book_id = :book_id AND status = 'pending'
        """),
        {'user_id': user_id, 'book_id': book_id}
    ).first()

    if existing:
        return jsonify({'error': 'You already have a reservation for this book'}), 409

    db.session.execute(
        text("""
            INSERT INTO reservations (user_id, book_id, expires_at)
            VALUES (:user_id, :book_id, DATE_ADD(NOW(), INTERVAL 48 HOUR))
        """),
        {'user_id': user_id, 'book_id': book_id}
    )
    db.session.commit()
    return jsonify({'message': 'Book reserved successfully. Collect within 48 hours.'}), 201


@users_bp.route('/me/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = int(get_jwt_identity())
    
    # Try to get AI recommendations first
    result = db.session.execute(
        text("""
            SELECT * FROM vw_recommendations 
            WHERE user_id = :user_id
            LIMIT 10
        """),
        {'user_id': user_id}
    )
    recommendations = [dict(row._mapping) for row in result]
    
    # Fallback to trending books if no recommendations
    if not recommendations:
        trending = db.session.execute(
            text("SELECT * FROM vw_trending_books LIMIT 10")
        )
        recommendations = [dict(row._mapping) for row in trending]
    
    return jsonify(recommendations), 200