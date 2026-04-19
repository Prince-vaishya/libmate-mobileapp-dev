# app/api/recommendations.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from ..extensions import db

recommendations_bp = Blueprint('recommendations', __name__)


@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized book recommendations for logged-in user"""
    user_id = int(get_jwt_identity())
    limit = request.args.get('limit', 10, type=int)
    
    query = """
        SELECT * FROM vw_recommendations
        WHERE user_id = :user_id
        ORDER BY similarity_score DESC
        LIMIT :limit
    """
    
    result = db.session.execute(
        text(query),
        {'user_id': user_id, 'limit': limit}
    )
    recommendations = [dict(row._mapping) for row in result]
    
    return jsonify(recommendations), 200


@recommendations_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_recommendations():
    """Trigger recommendation engine refresh for current user"""
    user_id = int(get_jwt_identity())
    
    # This would call your recommendation engine service
    # For now, just return a message
    return jsonify({
        'message': 'Recommendation refresh triggered',
        'user_id': user_id
    }), 202


@recommendations_bp.route('/has-recommendations', methods=['GET'])
@jwt_required()
def has_recommendations():
    """Check if user has any recommendations"""
    user_id = int(get_jwt_identity())
    
    result = db.session.execute(
        text("SELECT COUNT(*) as count FROM recommendations WHERE user_id = :user_id"),
        {'user_id': user_id}
    ).first()
    
    return jsonify({'has_recommendations': result[0] > 0, 'count': result[0]}), 200