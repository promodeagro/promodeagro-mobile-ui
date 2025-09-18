import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { X, CreditCard, Check } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  payment_type: 'card' | 'upi';
  masked_details: string;
  is_default: boolean;
  metadata?: {
    cardholderName?: string;
    expiryDate?: string;
    brand?: string;
    last4?: string;
    upiId?: string;
  };
}

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  editingMethod: PaymentMethod | null;
  onSave: () => void;
}

const PaymentMethodModal = ({ visible, onClose, editingMethod, onSave }: PaymentMethodModalProps) => {
  const [paymentType, setPaymentType] = useState<'card' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (editingMethod) {
      setPaymentType(editingMethod.payment_type);
      setIsDefault(editingMethod.is_default);
      
      if (editingMethod.payment_type === 'upi') {
        setUpiId(editingMethod.masked_details);
      } else if (editingMethod.payment_type === 'card') {
        setCardholderName(editingMethod.metadata?.cardholderName || '');
        // Don't pre-fill sensitive data like card number, expiry, CVV
      }
    } else {
      // Reset form for new payment method
      setPaymentType('card');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setUpiId('');
      setIsDefault(false);
    }
  }, [editingMethod, visible]);

  const resetForm = () => {
    setPaymentType('card');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setUpiId('');
    setIsDefault(false);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleaned;
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const maskCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return cardNumber;
    return '**** **** **** ' + cleaned.slice(-4);
  };

  const validateForm = () => {
    if (paymentType === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Error', 'Please enter a valid card number');
        return false;
      }
      if (!expiryDate || expiryDate.length < 5) {
        Alert.alert('Error', 'Please enter a valid expiry date');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        Alert.alert('Error', 'Please enter a valid CVV');
        return false;
      }
      if (!cardholderName.trim()) {
        Alert.alert('Error', 'Please enter cardholder name');
        return false;
      }
    } else if (paymentType === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        Alert.alert('Error', 'Please enter a valid UPI ID');
        return false;
      }
    }
    return true;
  };

  const getCardBrand = (cardNumber: string) => {
    const firstDigit = cardNumber[0];
    const firstTwoDigits = cardNumber.substring(0, 2);
    
    if (firstDigit === '4') return 'Visa';
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'Mastercard';
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'American Express';
    if (firstTwoDigits === '60' || firstTwoDigits === '65') return 'Discover';
    return 'Card';
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // In a real app, this would save to the backend
    console.log('Saving payment method:', {
      payment_type: paymentType,
      is_default: isDefault,
      cardNumber: paymentType === 'card' ? maskCardNumber(cardNumber) : undefined,
      upiId: paymentType === 'upi' ? upiId : undefined,
      cardholderName: paymentType === 'card' ? cardholderName : undefined,
      expiryDate: paymentType === 'card' ? expiryDate : undefined,
    });

    // Simulate success
    Alert.alert('Success', 'Payment method saved successfully!');
    onSave();
    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb'
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#111827'
          }}>
            {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Payment Type Selection */}
          <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#111827' }}>
              Payment Type
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setPaymentType('card')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: paymentType === 'card' ? '#6366f1' : '#e5e7eb',
                  backgroundColor: paymentType === 'card' ? '#f0f9ff' : 'white'
                }}
              >
                <CreditCard size={20} color={paymentType === 'card' ? '#6366f1' : '#6b7280'} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: paymentType === 'card' ? '#6366f1' : '#6b7280',
                  marginLeft: 8
                }}>
                  Card
                </Text>
                {paymentType === 'card' && (
                  <Check size={16} color="#6366f1" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentType('upi')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: paymentType === 'upi' ? '#6366f1' : '#e5e7eb',
                  backgroundColor: paymentType === 'upi' ? '#f0f9ff' : 'white'
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  backgroundColor: paymentType === 'upi' ? '#6366f1' : '#6b7280',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white' }}>U</Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: paymentType === 'upi' ? '#6366f1' : '#6b7280',
                  marginLeft: 8
                }}>
                  UPI
                </Text>
                {paymentType === 'upi' && (
                  <Check size={16} color="#6366f1" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          {paymentType === 'card' ? (
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#111827' }}>
                Card Details
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Card Number
                </Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  maxLength={19}
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#f9fafb'
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                    Expiry Date
                  </Text>
                  <TextInput
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5}
                    style={{
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                    CVV
                  </Text>
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    style={{
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Cardholder Name
                </Text>
                <TextInput
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  autoCapitalize="words"
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#f9fafb'
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#111827' }}>
                UPI Details
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  UPI ID
                </Text>
                <TextInput
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="your.name@upi"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#f9fafb'
                  }}
                />
              </View>
            </View>
          )}

          {/* Set as Default */}
          <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
            <TouchableOpacity
              onPress={() => setIsDefault(!isDefault)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: isDefault ? '#6366f1' : '#d1d5db',
                backgroundColor: isDefault ? '#6366f1' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                {isDefault && <Check size={14} color="white" />}
              </View>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151' }}>
                Set as default payment method
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={{ padding: 16, backgroundColor: 'white' }}>
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#6366f1',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {editingMethod ? 'Update Payment Method' : 'Save Payment Method'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;
