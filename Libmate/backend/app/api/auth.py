from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from sqlalchemy import text
from ..extensions import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Get user from database (only active users)
    result = db.session.execute(
        text("SELECT * FROM users WHERE email = :email AND is_active = TRUE"),
        {'email': email}
    ).first()
    
    if not result:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user = dict(result._mapping)
    
    # Verify password with bcrypt
    try:
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if user has active membership
    membership = db.session.execute(
        text("""
            SELECT * FROM memberships 
            WHERE user_id = :user_id AND status = 'active' AND expiry_date > CURDATE()
        """),
        {'user_id': user['user_id']}
    ).first()
    
    access_token = create_access_token(identity=str(user['user_id']))
    
    # Return user data (excluding password_hash)
    user_data = {
        'user_id': user['user_id'],
        'full_name': user['full_name'],
        'email': user['email'],
        'phone': user['phone'],
        'address': user['address'],
        'role': user['role'],
        'profile_picture': user['profile_picture']
    }
    
    m = dict(membership._mapping) if membership else None
    return jsonify({
        'token': access_token,
        'user': user_data,
        'has_active_membership': membership is not None,
        'membership': {
            'card_number':    m['card_number'],
            'expiry_date':    str(m['expiry_date'])    if m['expiry_date']    else None,
            'start_date':     str(m['start_date'])     if m['start_date']     else None,
            'status':         m['status'],
            'payment_status': m['payment_status'],
            'duration_months': m['duration_months'],
        } if m else None
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Email, password, and full name required'}), 400
    
    # Validate email format
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Check if user already exists
    existing = db.session.execute(
        text("SELECT user_id FROM users WHERE email = :email"),
        {'email': data['email']}
    ).first()
    
    if existing:
        return jsonify({'error': 'User already exists'}), 409
    
    # Hash password with bcrypt
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Insert new user (as guest initially)
    db.session.execute(
        text("""
            INSERT INTO users (full_name, email, phone, address, password_hash, role)
            VALUES (:full_name, :email, :phone, :address, :password_hash, 'guest')
        """),
        {
            'full_name': data['full_name'],
            'email': data['email'],
            'phone': data.get('phone'),
            'address': data.get('address'),
            'password_hash': hashed.decode('utf-8')
        }
    )
    db.session.commit()
    
    # Get the newly created user
    result = db.session.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {'email': data['email']}
    ).first()
    
    user = dict(result._mapping)
    access_token = create_access_token(identity=str(user['user_id']))
    
    user_data = {
        'user_id': user['user_id'],
        'full_name': user['full_name'],
        'email': user['email'],
        'phone': user['phone'],
        'address': user['address'],
        'role': user['role'],
        'profile_picture': user['profile_picture']
    }
    
    return jsonify({
        'token': access_token,
        'user': user_data
    }), 201


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT * FROM users WHERE user_id = :user_id AND is_active = TRUE"),
        {'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'User not found'}), 404
    
    user = dict(result._mapping)
    
    # Check active membership
    membership = db.session.execute(
        text("""
            SELECT * FROM memberships 
            WHERE user_id = :user_id AND status = 'active' AND expiry_date > CURDATE()
        """),
        {'user_id': user_id}
    ).first()
    
    user_data = {
        'user_id': user['user_id'],
        'full_name': user['full_name'],
        'email': user['email'],
        'phone': user['phone'],
        'address': user['address'],
        'role': user['role'],
        'profile_picture': user['profile_picture']
    }
    
    m = dict(membership._mapping) if membership else None
    return jsonify({
        'user': user_data,
        'has_active_membership': membership is not None,
        'membership': {
            'card_number':    m['card_number'],
            'expiry_date':    str(m['expiry_date'])    if m['expiry_date']    else None,
            'start_date':     str(m['start_date'])     if m['start_date']     else None,
            'status':         m['status'],
            'payment_status': m['payment_status'],
            'duration_months': m['duration_months'],
        } if m else None
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({'error': 'Old and new password required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    # Get current user
    result = db.session.execute(
        text("SELECT password_hash FROM users WHERE user_id = :user_id"),
        {'user_id': user_id}
    ).first()
    
    if not result:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify old password
    if not bcrypt.checkpw(old_password.encode('utf-8'), result[0].encode('utf-8')):
        return jsonify({'error': 'Invalid current password'}), 401
    
    # Hash new password
    new_hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    # Update password
    db.session.execute(
        text("UPDATE users SET password_hash = :password_hash WHERE user_id = :user_id"),
        {'password_hash': new_hashed.decode('utf-8'), 'user_id': user_id}
    )
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200