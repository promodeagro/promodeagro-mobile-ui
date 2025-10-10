import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Check,
  Star,
  MoreVertical
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';

interface PaymentMethod {
  id: string;
  payment_type: 'card' | 'upi';
  masked_details: string;
  is_default: boolean;
  last_used_at?: string;
  usage_count?: number;
  metadata?: {
    brand?: string;
    cardholderName?: string;
    expiryDate?: string;
    last4?: string;
    upiId?: string;
  };
}

export default function PaymentMethodsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Mock payment methods data for demonstration
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      payment_type: 'card',
      masked_details: '**** **** **** 1234',
      is_default: true,
      last_used_at: '2024-01-15T10:30:00Z',
      usage_count: 15,
      metadata: {
        brand: 'Visa',
        cardholderName: 'Rajesh Kumar',
        expiryDate: '12/25',
        last4: '1234'
      }
    },
    {
      id: '2',
      payment_type: 'upi',
      masked_details: 'rajesh.kumar@okicici',
      is_default: false,
      last_used_at: '2024-01-10T14:20:00Z',
      usage_count: 8,
      metadata: {
        upiId: 'rajesh.kumar@okicici'
      }
    },
    {
      id: '3',
      payment_type: 'card',
      masked_details: '**** **** **** 5678',
      is_default: false,
      last_used_at: '2024-01-05T16:45:00Z',
      usage_count: 3,
      metadata: {
        brand: 'Mastercard',
        cardholderName: 'Rajesh Kumar',
        expiryDate: '08/26',
        last4: '5678'
      }
    }
  ]);

  const handleDeleteMethod = (method: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${method.masked_details}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
            Alert.alert('Success', 'Payment method deleted successfully!');
          },
        },
      ]
    );
  };

  const handleSetDefault = (method: PaymentMethod) => {
    if (!method.is_default) {
      setPaymentMethods(prev => 
        prev.map(m => ({
          ...m,
          is_default: m.id === method.id
        }))
      );
      Alert.alert('Success', 'Default payment method updated!');
    }
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingMethod(null);
    setModalVisible(true);
  };

  const getPaymentMethodIcon = (type: 'card' | 'upi') => {
    switch (type) {
      case 'card':
        return <CreditCard size={24} color="#6366f1" />;
      case 'upi':
        return (
          <View style={{
            width: 24,
            height: 24,
            backgroundColor: '#f59e0b',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>U</Text>
          </View>
        );
      default:
        return <CreditCard size={24} color="#6b7280" />;
    }
  };

  const getPaymentMethodTitle = (method: PaymentMethod) => {
    switch (method.payment_type) {
      case 'card':
        return method.metadata?.brand ? 
          `${method.metadata.brand} Card` : 
          'Credit/Debit Card';
      case 'upi':
        return 'UPI ID';
      default:
        return method.payment_type;
    }
  };

  const formatLastUsed = (lastUsedAt?: string) => {
    if (!lastUsedAt) return 'Never used';
    
    const date = new Date(lastUsedAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Used today';
    if (diffInDays === 1) return 'Used yesterday';
    if (diffInDays < 7) return `Used ${diffInDays} days ago`;
    if (diffInDays < 30) return `Used ${Math.floor(diffInDays / 7)} weeks ago`;
    return `Used ${Math.floor(diffInDays / 30)} months ago`;
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={{
              fontSize: 20,
              fontFamily: 'Inter_700Bold',
              color: '#111827',
              marginLeft: 16
            }}>
              Payment Methods
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddNew}
            style={{
              backgroundColor: '#6366f1',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Plus size={16} color="white" />
            <Text style={{
              color: 'white',
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              marginLeft: 4
            }}>
              Add New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: '#f3f4f6',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <CreditCard size={32} color="#9ca3af" />
            </View>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Inter_600SemiBold',
              color: '#374151',
              marginBottom: 8
            }}>
              No Payment Methods
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Inter_400Regular',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 24
            }}>
              Add a payment method to make checkout faster and easier
            </Text>
            <TouchableOpacity
              onPress={handleAddNew}
              style={{
                backgroundColor: '#6366f1',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Plus size={16} color="white" />
              <Text style={{
                color: 'white',
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                marginLeft: 8
              }}>
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {paymentMethods.map((method) => (
              <View
                key={method.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: method.is_default ? 2 : 1,
                  borderColor: method.is_default ? '#6366f1' : '#e5e7eb'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {getPaymentMethodIcon(method.payment_type)}
                    
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{
                          fontSize: 16,
                          fontFamily: 'Inter_600SemiBold',
                          color: '#111827'
                        }}>
                          {getPaymentMethodTitle(method)}
                        </Text>
                        {method.is_default && (
                          <View style={{
                            backgroundColor: '#dcfce7',
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginLeft: 8,
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}>
                            <Star size={12} color="#16a34a" fill="#16a34a" />
                            <Text style={{
                              fontSize: 11,
                              fontFamily: 'Inter_600SemiBold',
                              color: '#16a34a',
                              marginLeft: 2
                            }}>
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={{
                        fontSize: 14,
                        fontFamily: 'Inter_500Medium',
                        color: '#374151',
                        marginTop: 2
                      }}>
                        {method.masked_details}
                      </Text>
                      
                      <Text style={{
                        fontSize: 12,
                        fontFamily: 'Inter_400Regular',
                        color: '#6b7280',
                        marginTop: 4
                      }}>
                        {formatLastUsed(method.last_used_at)} • Used {method.usage_count || 0} times
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {!method.is_default && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(method)}
                        style={{
                          backgroundColor: '#f3f4f6',
                          borderRadius: 8,
                          padding: 8
                        }}
                      >
                        <Check size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      onPress={() => handleEditMethod(method)}
                      style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: 8,
                        padding: 8
                      }}
                    >
                      <Edit3 size={16} color="#6b7280" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteMethod(method)}
                      style={{
                        backgroundColor: '#fef2f2',
                        borderRadius: 8,
                        padding: 8
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <PaymentMethodModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingMethod(null);
        }}
        editingMethod={editingMethod}
        onSave={() => {
          setModalVisible(false);
          setEditingMethod(null);
          // In a real app, this would refresh the payment methods
          Alert.alert('Success', 'Payment method updated successfully!');
        }}
      />
    </View>
  );
}
