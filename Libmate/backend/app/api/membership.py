from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from ..extensions import db

membership_bp = Blueprint('membership', __name__)


@membership_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_membership():
    """Apply for a membership"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    duration_months = data.get('duration_months', 12)
    
    # Check if user already has an active membership
    existing = db.session.execute(
        text("""
            SELECT membership_id FROM memberships 
            WHERE user_id = :user_id AND status = 'active'
        """),
        {'user_id': user_id}
    ).first()
    
    if existing:
        return jsonify({'error': 'You already have an active membership'}), 409
    
    # Check for pending application
    pending = db.session.execute(
        text("""
            SELECT membership_id FROM memberships 
            WHERE user_id = :user_id AND status = 'pending'
        """),
        {'user_id': user_id}
    ).first()
    
    if pending:
        return jsonify({'error': 'You already have a pending membership application'}), 409
    
    # Create membership application
    db.session.execute(
        text("""
            INSERT INTO memberships (user_id, duration_months, status, payment_status)
            VALUES (:user_id, :duration_months, 'pending', 'unpaid')
        """),
        {'user_id': user_id, 'duration_months': duration_months}
    )
    db.session.commit()
    
    return jsonify({'message': 'Membership application submitted successfully'}), 201


@membership_bp.route('/status', methods=['GET'])
@jwt_required()
def get_membership_status():
    """Get current user's membership status"""
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT * FROM vw_user_membership WHERE user_id = :user_id"),
        {'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'has_membership': False, 'message': 'No membership found'}), 200
    
    membership = dict(result._mapping)
    membership['has_membership'] = True
    
    return jsonify(membership), 200


@membership_bp.route('/upload-receipt', methods=['POST'])
@jwt_required()
def upload_receipt():
    """Upload payment receipt for membership"""
    user_id = int(get_jwt_identity())
    
    if 'receipt' not in request.files:
        return jsonify({'error': 'No receipt file provided'}), 400
    
    receipt = request.files['receipt']
    
    # In production, save file to cloud storage
    # For now, just update status
    db.session.execute(
        text("""
            UPDATE memberships 
            SET payment_status = 'paid', paid_at = NOW()
            WHERE user_id = :user_id AND status = 'pending'
        """),
        {'user_id': user_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Receipt uploaded successfully. Awaiting admin approval.'}), 200