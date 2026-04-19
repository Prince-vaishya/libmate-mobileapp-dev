import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarker, FaCamera, FaCreditCard, FaCalendarAlt, FaUpload, FaQrcode } from 'react-icons/fa';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [membershipData, setMembershipData] = useState({
    duration: '6',
    paymentReceipt: null,
    paymentMethod: 'esewa'
  });
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+977 9812345678',
    address: 'Kathmandu, Nepal'
  });

  const isMember = user?.role === 'member';

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleMembershipSubmit = (e) => {
    e.preventDefault();
    showToast('Membership request submitted! Awaiting admin approval.', 'success');
    setShowMembershipForm(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMembershipData({ ...membershipData, paymentReceipt: file });
      showToast('Receipt uploaded successfully!', 'success');
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-40">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2C1F14]">My Profile</h1>
          <p className="text-[#9A8478] mt-1">Manage your account details and membership</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Editable Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EAE0D0] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-[#2C1F14]">Personal Details</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm text-[#C4895A] border border-[#C4895A] rounded-full hover:bg-[#C4895A] hover:text-white transition"
                  >
                    Edit Details
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm bg-[#2C1F14] text-white rounded-full hover:bg-[#4A3728] transition"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#2C1F14] to-[#4A3728] rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#C4895A] rounded-full flex items-center justify-center text-white text-sm hover:bg-[#D4A574] transition">
                    <FaCamera size={14} />
                  </button>
                </div>
                <div>
                  <div className="font-serif text-xl font-bold text-[#2C1F14]">{user?.name}</div>
                  <div className="text-sm text-[#9A8478]">Member since {user?.joinedDate || '2025'}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                    isMember ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isMember ? 'Active Member' : 'Guest'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#FAF7F2] rounded-lg text-[#2C1F14]">{profileData.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#FAF7F2] rounded-lg text-[#2C1F14]">{profileData.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#FAF7F2] rounded-lg text-[#2C1F14]">{profileData.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-[#FAF7F2] rounded-lg text-[#2C1F14]">{profileData.address}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EAE0D0] p-6">
              <h2 className="font-serif text-xl font-bold text-[#2C1F14] mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-[#EAE0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent"
                    placeholder="Repeat new password"
                  />
                </div>
                <button className="px-4 py-2 bg-[#2C1F14] text-white rounded-lg hover:bg-[#4A3728] transition">
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Membership Card or Request Form */}
          <div className="space-y-6">
            {isMember ? (
              // Membership Card (for members)
              <div className="bg-gradient-to-br from-[#2C1F14] to-[#4A3728] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4895A]/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C4895A]/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs text-[#9A8478] uppercase tracking-wider">SmartLib Membership Card</div>
                      <div className="font-serif text-xl font-bold mt-1">{user?.name}</div>
                    </div>
                    <div className="w-12 h-12 bg-[#C4895A] rounded-xl flex items-center justify-center">
                      <span className="text-white font-serif text-xl font-bold">S</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm font-mono tracking-wider">{user?.membershipCard || 'SMLIB-2025-0157'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div>
                      <div className="text-xs text-white/50">Member Since</div>
                      <div className="text-sm font-medium">{user?.joinedDate || 'Nov 15, 2024'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Valid Until</div>
                      <div className="text-sm font-medium text-[#D4A574]">{user?.expiryDate || 'May 15, 2025'}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Status</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : showMembershipForm ? (
              // Membership Request Form (for guests who clicked "Request Membership")
              <div className="bg-white rounded-xl shadow-sm border border-[#EAE0D0] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#2C1F14]">Request Membership</h3>
                  <button
                    onClick={() => setShowMembershipForm(false)}
                    className="text-[#9A8478] hover:text-[#C4895A] transition"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleMembershipSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4A3728] mb-2">Select Duration</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMembershipData({ ...membershipData, duration: '3' })}
                        className={`p-3 rounded-lg border text-center transition ${
                          membershipData.duration === '3'
                            ? 'border-[#C4895A] bg-[#C4895A]/10 text-[#C4895A]'
                            : 'border-[#EAE0D0] text-[#4A3728] hover:border-[#C4895A]'
                        }`}
                      >
                        <div className="font-semibold">3 Months</div>
                        <div className="text-sm">NPR 200</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMembershipData({ ...membershipData, duration: '6' })}
                        className={`p-3 rounded-lg border text-center transition ${
                          membershipData.duration === '6'
                            ? 'border-[#C4895A] bg-[#C4895A]/10 text-[#C4895A]'
                            : 'border-[#EAE0D0] text-[#4A3728] hover:border-[#C4895A]'
                        }`}
                      >
                        <div className="font-semibold">6 Months</div>
                        <div className="text-sm">NPR 500 <span className="text-xs text-green-600">(Best value)</span></div>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4A3728] mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMembershipData({ ...membershipData, paymentMethod: 'esewa' })}
                        className={`p-2 rounded-lg border text-center transition ${
                          membershipData.paymentMethod === 'esewa'
                            ? 'border-[#C4895A] bg-[#C4895A]/10 text-[#C4895A]'
                            : 'border-[#EAE0D0] text-[#4A3728]'
                        }`}
                      >
                        <FaQrcode className="mx-auto mb-1 text-lg" />
                        <span className="text-sm">eSewa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMembershipData({ ...membershipData, paymentMethod: 'khalti' })}
                        className={`p-2 rounded-lg border text-center transition ${
                          membershipData.paymentMethod === 'khalti'
                            ? 'border-[#C4895A] bg-[#C4895A]/10 text-[#C4895A]'
                            : 'border-[#EAE0D0] text-[#4A3728]'
                        }`}
                      >
                        <FaQrcode className="mx-auto mb-1 text-lg" />
                        <span className="text-sm">Khalti</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4A3728] mb-2">Payment Receipt</label>
                    <div className="border-2 border-dashed border-[#EAE0D0] rounded-lg p-4 text-center hover:border-[#C4895A] transition cursor-pointer">
                      <input
                        type="file"
                        id="receipt"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="receipt" className="cursor-pointer block">
                        <FaUpload className="mx-auto text-2xl text-[#9A8478] mb-2" />
                        <p className="text-sm text-[#9A8478]">Click to upload payment screenshot</p>
                        <p className="text-xs text-[#9A8478] mt-1">PNG, JPG up to 2MB</p>
                      </label>
                    </div>
                    {membershipData.paymentReceipt && (
                      <p className="text-xs text-green-600 mt-2">✓ Receipt uploaded: {membershipData.paymentReceipt.name}</p>
                    )}
                  </div>

                  <div className="bg-[#C4895A]/10 rounded-lg p-3 mb-4">
                    <p className="text-xs text-[#C4895A] text-center">
                      After submitting, admin will review your request and activate membership within 24 hours.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#C4895A] text-white rounded-lg hover:bg-[#D4A574] transition"
                  >
                    Submit Request
                  </button>
                </form>
              </div>
            ) : (
              // Membership CTA (for guests not requesting yet)
              <div className="bg-white rounded-xl shadow-sm border border-[#EAE0D0] p-6 text-center">
                <div className="w-16 h-16 bg-[#C4895A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCreditCard className="text-[#C4895A] text-2xl" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C1F14] mb-2">Become a Member</h3>
                <p className="text-sm text-[#9A8478] mb-4">
                  Unlock exclusive benefits: borrow books, get AI recommendations, and more!
                </p>
                <ul className="text-left text-sm text-[#9A8478] mb-4 space-y-1">
                  <li>✓ Borrow up to 3 books at a time</li>
                  <li>✓ AI-powered book recommendations</li>
                  <li>✓ Reserve unavailable books</li>
                  <li>✓ Priority support</li>
                </ul>
                <button
                  onClick={() => setShowMembershipForm(true)}
                  className="w-full py-2 bg-[#C4895A] text-white rounded-lg hover:bg-[#D4A574] transition"
                >
                  Request Membership
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;