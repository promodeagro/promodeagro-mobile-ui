import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { X, Plus, Minus, Edit3 } from 'lucide-react-native';

const OrderModificationModal = ({ visible, onClose, order, onModify }: { 
  visible: boolean, 
  onClose: () => void, 
  order: any, 
  onModify: (data: any) => Promise<void> 
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setDeliveryAddress(order.delivery_address || '');
      setDeliveryInstructions(order.delivery_instructions || '');
    }
  }, [order]);

  const updateItemQuantity = (itemId: any, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.id !== itemId));
    } else {
      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const handleModify = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for modification');
      return;
    }

    setLoading(true);
    try {
      await onModify({
        items: items.map(item => ({
          product_id: item.product.id,
          variation_id: item.variation?.id,
          quantity: item.quantity
        })),
        deliveryAddress,
        deliveryInstructions,
        reason
      });
      onClose();
    } catch (error: any) {
      alert('Failed to modify order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const canModify = ['pending', 'confirmed'].includes(order.status);

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
            <Edit3 size={24} color="#16a34a" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#1f2937' }}>
              Modify Order
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {!canModify ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
              This order cannot be modified as it's already being processed.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {/* Order Items */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>
                Order Items
              </Text>
              
              {items.map((item) => (
                <View key={item.id} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6'
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
                      {item.product.name}
                    </Text>
                    {item.variation && (
                      <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                        {item.variation.name} - {item.variation.unit}
                      </Text>
                    )}
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a', marginTop: 4 }}>
                      ₹{item.unit_price}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Minus size={16} color="#6b7280" />
                    </TouchableOpacity>
                    
                    <Text style={{ 
                      marginHorizontal: 16, 
                      fontSize: 16, 
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {item.quantity}
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#16a34a',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb'
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                  New Total
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16a34a' }}>
                  ₹{calculateTotal()}
                </Text>
              </View>
            </View>

            {/* Delivery Address */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                Delivery Address
              </Text>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlignVertical: 'top'
                }}
                placeholder="Enter delivery address..."
              />
            </View>

            {/* Delivery Instructions */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                Delivery Instructions
              </Text>
              <TextInput
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
                multiline
                numberOfLines={2}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlignVertical: 'top'
                }}
                placeholder="Any special instructions..."
              />
            </View>

            {/* Reason for Modification */}
            <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                Reason for Modification *
              </Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={2}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlignVertical: 'top'
                }}
                placeholder="Please explain why you want to modify this order..."
              />
            </View>

            {/* Action Button */}
            <View style={{ padding: 16 }}>
              <TouchableOpacity
                onPress={handleModify}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#9ca3af' : '#16a34a',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    Modify Order
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

export default OrderModificationModal;
