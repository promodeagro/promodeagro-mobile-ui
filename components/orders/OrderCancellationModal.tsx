import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { X, AlertTriangle, RefreshCw } from 'lucide-react-native';

const OrderCancellationModal = ({ visible, onClose, order, onCancel }: { 
  visible: boolean, 
  onClose: () => void, 
  order: any, 
  onCancel: (data: any) => Promise<void> 
}) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const cancellationReasons = [
    'Changed my mind',
    'Ordered by mistake',
    'Found better price elsewhere',
    'Delivery time too long',
    'Need different items',
    'Emergency situation',
    'Other'
  ];

  const getRefundInfo = () => {
    if (!order) return { refundAmount: 0, refundPercentage: 0 };

    const totalAmount = parseFloat(order.total_amount);
    
    if (order.payment_status !== 'completed' && order.payment_status !== 'paid') {
      return { refundAmount: 0, refundPercentage: 0, message: 'No payment made yet' };
    }

    switch (order.status) {
      case 'pending':
      case 'confirmed':
        return { 
          refundAmount: totalAmount, 
          refundPercentage: 100, 
          message: 'Full refund within 3-5 business days' 
        };
      case 'preparing':
        return { 
          refundAmount: totalAmount * 0.8, 
          refundPercentage: 80, 
          message: '80% refund (preparation fee deducted)' 
        };
      default:
        return { 
          refundAmount: 0, 
          refundPercentage: 0, 
          message: 'Order cannot be cancelled at this stage' 
        };
    }
  };

  const handleCancel = async () => {
    const finalReason = selectedReason === 'Other' ? reason : selectedReason;
    
    if (!finalReason.trim()) {
      Alert.alert('Error', 'Please select or provide a reason for cancellation');
      return;
    }

    const refundInfo = getRefundInfo();
    
    Alert.alert(
      'Confirm Cancellation',
      `Are you sure you want to cancel this order?\n\n${refundInfo.message}\nRefund amount: ₹${refundInfo.refundAmount}`,
      [
        { text: 'Keep Order', style: 'cancel' },
        { 
          text: 'Cancel Order', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onCancel({
                reason: finalReason,
                cancellationType: 'customer'
              });
              onClose();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to cancel order: ' + error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!order) return null;

  const canCancel = ['pending', 'confirmed', 'preparing'].includes(order.status);
  const refundInfo = getRefundInfo();

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
          borderBottomColor: '#e9ecef'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle size={24} color="#ef4444" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#1f2937' }}>
              Cancel Order
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {!canCancel ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#ef4444', textAlign: 'center', marginBottom: 8 }}>
              Cannot Cancel Order
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
              This order is already being processed and cannot be cancelled at this stage.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {/* Order Info */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                Order #{order.id}
              </Text>
              <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 8 }}>
                Status: <Text style={{ color: '#f59e0b', fontWeight: '600' }}>{order.status}</Text>
              </Text>
              <Text style={{ fontSize: 16, color: '#6b7280' }}>
                Total: <Text style={{ color: '#16a34a', fontWeight: '600' }}>₹{order.total_amount}</Text>
              </Text>
            </View>

            {/* Refund Information */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <RefreshCw size={20} color="#16a34a" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#1f2937' }}>
                  Refund Information
                </Text>
              </View>
              
              <View style={{ 
                backgroundColor: '#f0fdf4', 
                padding: 12, 
                borderRadius: 8, 
                borderLeftWidth: 4, 
                borderLeftColor: '#16a34a' 
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#15803d', marginBottom: 4 }}>
                  {refundInfo.message}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#15803d' }}>
                  Refund Amount: ₹{refundInfo.refundAmount}
                </Text>
                {refundInfo.refundPercentage < 100 && refundInfo.refundPercentage > 0 && (
                  <Text style={{ fontSize: 14, color: '#65a30d', marginTop: 4 }}>
                    ({refundInfo.refundPercentage}% of total amount)
                  </Text>
                )}
              </View>
            </View>

            {/* Cancellation Reasons */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>
                Reason for Cancellation *
              </Text>
              
              {cancellationReasons.map((reasonOption) => (
                <TouchableOpacity
                  key={reasonOption}
                  onPress={() => setSelectedReason(reasonOption)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: selectedReason === reasonOption ? '#f0fdf4' : '#f9fafb',
                    borderWidth: 1,
                    borderColor: selectedReason === reasonOption ? '#16a34a' : '#e5e7eb'
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedReason === reasonOption ? '#16a34a' : '#d1d5db',
                    backgroundColor: selectedReason === reasonOption ? '#16a34a' : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedReason === reasonOption && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'white'
                      }} />
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: selectedReason === reasonOption ? '#15803d' : '#1f2937'
                  }}>
                    {reasonOption}
                  </Text>
                </TouchableOpacity>
              ))}

              {selectedReason === 'Other' && (
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    textAlignVertical: 'top',
                    marginTop: 12
                  }}
                  placeholder="Please specify your reason..."
                />
              )}
            </View>

            {/* Warning */}
            <View style={{ 
              backgroundColor: '#fef3c7', 
              margin: 16, 
              borderRadius: 12, 
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b'
            }}>
              <Text style={{ fontSize: 16, color: '#92400e', fontWeight: '600', marginBottom: 8 }}>
                Important Notice
              </Text>
              <Text style={{ fontSize: 14, color: '#92400e', lineHeight: 20 }}>
                • Cancellation cannot be undone{'\n'}
                • Refunds take 3-5 business days to process{'\n'}
                • Multiple cancellations may affect future orders
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#374151', fontSize: 16, fontWeight: 'bold' }}>
                  Keep Order
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleCancel}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: loading ? '#9ca3af' : '#ef4444',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    Cancel Order
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default OrderCancellationModal;
