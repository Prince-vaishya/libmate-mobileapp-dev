from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from datetime import datetime, timedelta, date
from ..extensions import db

borrowings_bp = Blueprint('borrowings', __name__)


@borrowings_bp.route('', methods=['GET'])
@jwt_required()
def get_borrowings():
    """Get current user's active borrowings"""
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT * FROM vw_active_borrowings WHERE user_id = :user_id"),
        {'user_id': user_id}
    )
    borrowings = [dict(row._mapping) for row in result]
    
    return jsonify(borrowings), 200


@borrowings_bp.route('/history', methods=['GET'])
@jwt_required()
def get_borrow_history():
    """Get current user's borrow history"""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = """
        SELECT * FROM vw_borrow_history 
        WHERE user_id = :user_id
        ORDER BY returned_at DESC
        LIMIT :limit OFFSET :offset
    """
    
    result = db.session.execute(
        text(query),
        {
            'user_id': user_id,
            'limit': per_page,
            'offset': (page - 1) * per_page
        }
    )
    history = [dict(row._mapping) for row in result]
    
    # Get total count
    count_result = db.session.execute(
        text("SELECT COUNT(*) FROM vw_borrow_history WHERE user_id = :user_id"),
        {'user_id': user_id}
    ).first()
    total = count_result[0] if count_result else 0
    
    return jsonify({
        'history': history,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    }), 200


@borrowings_bp.route('/<int:borrow_id>/renew', methods=['POST'])
@jwt_required()
def request_renewal(borrow_id):
    """Request renewal for a borrowed book"""
    user_id = int(get_jwt_identity())
    
    # Check if borrow exists and belongs to user
    result = db.session.execute(
        text("""
            SELECT * FROM borrowings 
            WHERE borrow_id = :borrow_id AND user_id = :user_id 
            AND status NOT IN ('returned', 'lost')
        """),
        {'borrow_id': borrow_id, 'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'Borrow record not found'}), 404
    
    # Check renewal count (max 2 renewals)
    if result.renewal_count >= 2:
        return jsonify({'error': 'Maximum renewals (2) reached for this book'}), 400
    
    # Check if already requested
    if result.renewal_requested:
        return jsonify({'error': 'Renewal already requested for this book'}), 400
    
    # Request renewal
    db.session.execute(
        text("""
            UPDATE borrowings 
            SET renewal_requested = TRUE, renewal_status = 'pending', updated_at = NOW()
            WHERE borrow_id = :borrow_id
        """),
        {'borrow_id': borrow_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Renewal request submitted successfully'}), 200


@borrowings_bp.route('/<int:borrow_id>/return', methods=['POST'])
@jwt_required()
def return_book(borrow_id):
    """Return a borrowed book"""
    user_id = int(get_jwt_identity())
    
    # Check if borrow exists and belongs to user
    result = db.session.execute(
        text("""
            SELECT * FROM borrowings 
            WHERE borrow_id = :borrow_id AND user_id = :user_id 
            AND status IN ('borrowed', 'overdue')
        """),
        {'borrow_id': borrow_id, 'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'Active borrow record not found'}), 404
    
    # Return the book (trigger will handle the rest)
    db.session.execute(
        text("""
            UPDATE borrowings 
            SET status = 'returned', returned_at = NOW(), updated_at = NOW()
            WHERE borrow_id = :borrow_id
        """),
        {'borrow_id': borrow_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Book returned successfully'}), 200


@borrowings_bp.route('/<int:borrow_id>/pay-fine', methods=['POST'])
@jwt_required()
def pay_fine(borrow_id):
    """Pay fine for an overdue book"""
    user_id = int(get_jwt_identity())
    
    data = request.get_json()
    payment_method = data.get('payment_method', 'card')
    
    # Check if borrow exists and belongs to user
    result = db.session.execute(
        text("""
            SELECT * FROM borrowings 
            WHERE borrow_id = :borrow_id AND user_id = :user_id
            AND fine_status = 'unpaid'
        """),
        {'borrow_id': borrow_id, 'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'No unpaid fine found for this borrow record'}), 404
    
    # Calculate fine amount
    days_overdue = max((date.today() - result.due_date).days, 0)
    fine_amount = days_overdue * 5.00
    
    # Update fine status (in real implementation, integrate with payment gateway)
    db.session.execute(
        text("""
            UPDATE borrowings 
            SET fine_status = 'paid', fine_paid_at = NOW(), updated_at = NOW()
            WHERE borrow_id = :borrow_id
        """),
        {'borrow_id': borrow_id}
    )
    db.session.commit()
    
    return jsonify({
        'message': 'Fine paid successfully',
        'amount_paid': fine_amount
    }), 200