import React, { useState } from 'react';
import './ConsentForm.css';

const ConsentForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    therapyName: '',
    phoneNumber: '',
    dateOfBirth: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    understoodInfo: false,
    risksUnderstood: false,
    questionsAsked: false,
    agreeToTreatment: false,
    signature: ''
  });

  const therapies = [
    'Panchakarma Therapy',
    'Shirodhara Therapy',
    'Basti Therapy',
    'Nasya Therapy',
    'Raktamokshana',
    'Swedana Therapy',
    'Abhyanga Massage',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Consent Form Submitted:', formData);
    alert('Consent form submitted successfully!');
    // In real app, this would send data to backend
  };

  return (
    <div className="consent-form-container">
      <div className="consent-header">
        <h1>AyushCare - Therapy Consent Form</h1>
        <p className="form-subtitle">Please read carefully and fill all required fields</p>
      </div>

      <form onSubmit={handleSubmit} className="consent-form">
        {/* Patient Information Section */}
        <div className="form-section">
          <h2 className="section-title">Patient Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="patientName">Full Name *</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="therapyName">Therapy Name *</label>
              <select
                id="therapyName"
                name="therapyName"
                value={formData.therapyName}
                onChange={handleChange}
                required
              >
                <option value="">Select Therapy</option>
                {therapies.map((therapy, index) => (
                  <option key={index} value={therapy}>{therapy}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter 10-digit phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact *</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                placeholder="Name & phone number"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="form-section">
          <h2 className="section-title">Medical Information</h2>
          
          <div className="form-group">
            <label htmlFor="medicalHistory">Relevant Medical History</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows="3"
              placeholder="Any previous conditions, surgeries, or chronic illnesses"
            />
          </div>

          <div className="form-group">
            <label htmlFor="allergies">Allergies (if any)</label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows="2"
              placeholder="List any allergies to medications, foods, or materials"
            />
          </div>
        </div>

        {/* Consent Statements */}
        <div className="form-section">
          <h2 className="section-title">Consent Statements</h2>
          
          <div className="consent-statements">
            <p className="statement-text">
              I understand that {formData.therapyName || 'the selected therapy'} involves traditional Ayurvedic procedures that may include herbal treatments, massage, and detoxification processes.
            </p>
            
            <p className="statement-text">
              I have been informed about the potential benefits and risks associated with this therapy, including but not limited to temporary discomfort, allergic reactions, or other side effects.
            </p>
            
            <p className="statement-text">
              I acknowledge that I have had the opportunity to ask questions about the therapy and my questions have been answered to my satisfaction.
            </p>
            
            <p className="statement-text">
              I understand that I should inform my therapist immediately if I experience any discomfort during the procedure.
            </p>
          </div>

          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="understoodInfo"
                name="understoodInfo"
                checked={formData.understoodInfo}
                onChange={handleChange}
                required
              />
              <label htmlFor="understoodInfo">
                I confirm that I have read and understood the information about the therapy
              </label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="risksUnderstood"
                name="risksUnderstood"
                checked={formData.risksUnderstood}
                onChange={handleChange}
                required
              />
              <label htmlFor="risksUnderstood">
                I understand the potential risks and benefits of this therapy
              </label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="questionsAsked"
                name="questionsAsked"
                checked={formData.questionsAsked}
                onChange={handleChange}
                required
              />
              <label htmlFor="questionsAsked">
                I have had the opportunity to ask questions and they have been answered
              </label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="agreeToTreatment"
                name="agreeToTreatment"
                checked={formData.agreeToTreatment}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeToTreatment">
                I voluntarily agree to undergo {formData.therapyName || 'this therapy'}
              </label>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="form-section">
          <div className="signature-section">
            <div className="form-group">
              <label htmlFor="signature">Signature *</label>
              <input
                type="text"
                id="signature"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                required
                placeholder="Type your full name as digital signature"
              />
              <p className="signature-note">By typing your name, you are providing your digital signature</p>
            </div>

            <div className="date-field">
              <label>Date</label>
              <div className="date-display">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Final Agreement Checkbox */}
        <div className="final-agreement">
          <div className="agreement-checkbox">
            <input
              type="checkbox"
              id="finalAgreement"
              name="finalAgreement"
              required
            />
            <label htmlFor="finalAgreement" className="agreement-label">
              <strong>✓ I AGREE</strong> - I have read, understood, and agree to all terms and conditions above
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="button" className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit Consent Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsentForm;