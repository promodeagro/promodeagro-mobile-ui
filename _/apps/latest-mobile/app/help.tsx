import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  Star,
  Clock,
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  Package,
  Settings,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const HelpScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: 'orders',
      title: 'Orders & Delivery',
      description: 'Track orders, delivery issues, returns',
      icon: <ShoppingBag size={24} color="#16a34a" />,
      color: '#16a34a',
    },
    {
      id: 'payment',
      title: 'Payment & Billing',
      description: 'Payment methods, refunds, billing issues',
      icon: <CreditCard size={24} color="#3b82f6" />,
      color: '#3b82f6',
    },
    {
      id: 'delivery',
      title: 'Delivery Support',
      description: 'Delivery timing, address changes',
      icon: <Truck size={24} color="#f59e0b" />,
      color: '#f59e0b',
    },
    {
      id: 'products',
      title: 'Product Support',
      description: 'Product quality, replacements',
      icon: <Package size={24} color="#8b5cf6" />,
      color: '#8b5cf6',
    },
    {
      id: 'account',
      title: 'Account & Settings',
      description: 'Profile, preferences, security',
      icon: <User size={24} color="#ef4444" />,
      color: '#ef4444',
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How can I track my order?',
      answer: 'You can track your order in real-time through the "Orders" section in your profile. We\'ll also send you SMS and email updates at every step.',
      category: 'orders',
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and cash on delivery.',
      category: 'payment',
    },
    {
      id: '3',
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 2-4 hours in metro cities and 24-48 hours in other areas. Express delivery is available in select cities.',
      category: 'delivery',
    },
    {
      id: '4',
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 30 minutes of placing it. After that, please contact our support team for assistance.',
      category: 'orders',
    },
    {
      id: '5',
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for most products. Damaged or incorrect items can be returned immediately.',
      category: 'products',
    },
    {
      id: '6',
      question: 'How do I change my delivery address?',
      answer: 'You can update your delivery address in your profile settings. For existing orders, please contact support immediately.',
      category: 'delivery',
    },
  ];

  const filteredFAQs = searchQuery
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const contactSupport = (method: string) => {
    switch (method) {
      case 'chat':
        Alert.alert('Live Chat', 'Connecting you to our support team...');
        break;
      case 'call':
        Alert.alert('Call Support', 'Calling our support team at +91-1800-123-4567');
        break;
      case 'email':
        Alert.alert('Email Support', 'Opening email client...');
        break;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa', paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#1f2937',
            }}
          >
            Help & Support
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search for help topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: '#1f2937',
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Contact */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              Get Help Quickly
            </Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => contactSupport('chat')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f0f9ff',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#0ea5e9',
                }}
              >
                <MessageCircle size={20} color="#0ea5e9" />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#0c4a6e',
                  }}
                >
                  Live Chat Support
                </Text>
                <ChevronRight size={20} color="#0ea5e9" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => contactSupport('call')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f0fdf4',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#16a34a',
                }}
              >
                <Phone size={20} color="#16a34a" />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#14532d',
                  }}
                >
                  Call Support
                </Text>
                <ChevronRight size={20} color="#16a34a" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => contactSupport('email')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fef3c7',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#f59e0b',
                }}
              >
                <Mail size={20} color="#f59e0b" />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#92400e',
                  }}
                >
                  Email Support
                </Text>
                <ChevronRight size={20} color="#f59e0b" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Categories */}
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              Help Categories
            </Text>
            <View style={{ gap: 12 }}>
              {helpCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: '#f9fafb',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${category.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    {category.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: 4,
                      }}
                    >
                      {category.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#6b7280',
                      }}
                    >
                      {category.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQ Section */}
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <HelpCircle size={24} color="#8b5cf6" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1f2937',
                  marginLeft: 12,
                }}
              >
                Frequently Asked Questions
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {filteredFAQs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => toggleFAQ(faq.id)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      padding: 16,
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: '#1f2937',
                          flex: 1,
                        }}
                      >
                        {faq.question}
                      </Text>
                      <ChevronRight
                        size={20}
                        color="#6b7280"
                        style={{
                          transform: [{ rotate: expandedFAQ === faq.id ? '90deg' : '0deg' }],
                        }}
                      />
                    </View>
                  </View>
                  {expandedFAQ === faq.id && (
                    <View
                      style={{
                        padding: 16,
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#e5e7eb',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#6b7280',
                          lineHeight: 20,
                        }}
                      >
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Info */}
          <View
            style={{
              backgroundColor: '#f0f9ff',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: '#0ea5e9',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: 12,
              }}
            >
              Still Need Help?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#0369a1',
                lineHeight: 20,
                marginBottom: 16,
              }}
            >
              Our support team is available 24/7 to help you with any questions or issues.
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color="#0ea5e9" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: '#0369a1' }}>
                  Available 24/7
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Star size={16} color="#0ea5e9" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: '#0369a1' }}>
                  Average response time: 2 minutes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpScreen;
