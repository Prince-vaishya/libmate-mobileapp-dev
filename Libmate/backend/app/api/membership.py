from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from ..extensions import db
import os
import uuid

membership_bp = Blueprint('membership', __name__)


@membership_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_membership():
    user_id = int(get_jwt_identity())

    # Support both JSON (mobile app) and multipart FormData (web app)
    if request.is_json:
        data = request.get_json() or {}
        duration_months = int(data.get('duration_months', 12))
        receipt_file = None
    else:
        duration_months = int(request.form.get('duration_months', 12))
        receipt_file = request.files.get('payment_receipt')

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

    # Save payment receipt file if provided
    receipt_filename = None
    payment_status = 'unpaid'

    if receipt_file and receipt_file.filename:
        ext = receipt_file.filename.rsplit('.', 1)[-1].lower() if '.' in receipt_file.filename else ''
        allowed = {'jpg', 'jpeg', 'png', 'webp', 'pdf'}
        if ext in allowed:
            receipt_folder = os.path.join(
                os.path.dirname(current_app.config['UPLOAD_FOLDER']), 'receipts'
            )
            os.makedirs(receipt_folder, exist_ok=True)
            receipt_filename = f"{uuid.uuid4().hex}.{ext}"
            receipt_file.save(os.path.join(receipt_folder, receipt_filename))
            payment_status = 'paid'

    # Update profile fields included in the web form (full_name, phone, address)
    profile_updates = []
    profile_params = {'user_id': user_id}
    for field in ('full_name', 'phone', 'address'):
        val = request.form.get(field) if not request.is_json else None
        if val is not None:
            profile_updates.append(f"{field} = :{field}")
            profile_params[field] = val

    if profile_updates:
        db.session.execute(
            text(f"UPDATE users SET {', '.join(profile_updates)}, updated_at = NOW() WHERE user_id = :user_id"),
            profile_params
        )

    db.session.execute(
        text("""
            INSERT INTO memberships (user_id, duration_months, status, payment_status, payment_receipt)
            VALUES (:user_id, :duration_months, 'pending', :payment_status, :payment_receipt)
        """),
        {
            'user_id': user_id,
            'duration_months': duration_months,
            'payment_status': payment_status,
            'payment_receipt': receipt_filename,
        }
    )
    db.session.commit()

    return jsonify({'message': 'Membership application submitted successfully'}), 201


@membership_bp.route('/status', methods=['GET'])
@jwt_required()
def get_membership_status():
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
    user_id = int(get_jwt_identity())

    if 'receipt' not in request.files:
        return jsonify({'error': 'No receipt file provided'}), 400

    receipt = request.files['receipt']

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
