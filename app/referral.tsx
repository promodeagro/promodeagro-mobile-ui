import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Gift,
  Users,
  Share2,
  Copy,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
  QrCode,
  MessageCircle,
  Mail,
  Smartphone,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingReferrals: number;
}

interface ReferralHistory {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  earnings: number;
}

const ReferralScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [referralCode] = useState('RAJESH2024');
  const [referralLink] = useState('https://createxyz.com/ref/RAJESH2024');
  const [copied, setCopied] = useState(false);

  const stats: ReferralStats = {
    totalReferrals: 12,
    successfulReferrals: 8,
    totalEarnings: 2400,
    pendingReferrals: 4,
  };

  const referralHistory: ReferralHistory[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      status: 'completed',
      date: '2024-01-15',
      earnings: 300,
    },
    {
      id: '2',
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      status: 'completed',
      date: '2024-01-12',
      earnings: 300,
    },
    {
      id: '3',
      name: 'Neha Singh',
      email: 'neha.singh@email.com',
      status: 'pending',
      date: '2024-01-10',
      earnings: 0,
    },
    {
      id: '4',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@email.com',
      status: 'completed',
      date: '2024-01-08',
      earnings: 300,
    },
  ];

  const copyReferralCode = async () => {
    try {
      await Share.share({
        message: `Join me on CreateXYZ! Use my referral code: ${referralCode}\n\n${referralLink}`,
        title: 'Join CreateXYZ with my referral code!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#16a34a';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          Referral Program
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 20,
              padding: 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Gift size={32} color="white" />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: 'white',
                  marginLeft: 12,
                }}
              >
                Earn ₹300 per Referral!
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 24,
                marginBottom: 20,
              }}
            >
              Invite your friends to CreateXYZ and both of you get ₹300 in your wallet when they make their first order!
            </Text>
            <TouchableOpacity
              onPress={copyReferralCode}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 25,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <Share2 size={20} color="white" />
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}
              >
                Share & Earn
              </Text>
            </TouchableOpacity>
          </View>

          {/* Referral Code Section */}
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
              Your Referral Code
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#1f2937',
                  flex: 1,
                  textAlign: 'center',
                  letterSpacing: 2,
                }}
              >
                {referralCode}
              </Text>
              <TouchableOpacity
                onPress={copyToClipboard}
                style={{
                  backgroundColor: '#16a34a',
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                {copied ? (
                  <CheckCircle size={20} color="white" />
                ) : (
                  <Copy size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Share this code with friends or use the share button above
            </Text>
          </View>

          {/* Stats Section */}
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
              Your Referral Stats
            </Text>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={20} color="#3b82f6" />
                  <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>
                    Total Referrals
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
                  {stats.totalReferrals}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle size={20} color="#16a34a" />
                  <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>
                    Successful
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#16a34a' }}>
                  {stats.successfulReferrals}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TrendingUp size={20} color="#f59e0b" />
                  <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>
                    Pending
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#f59e0b' }}>
                  {stats.pendingReferrals}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Award size={20} color="#8b5cf6" />
                  <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>
                    Total Earnings
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#8b5cf6' }}>
                  ₹{stats.totalEarnings}
                </Text>
              </View>
            </View>
          </View>

          {/* How It Works */}
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
              How It Works
            </Text>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#16a34a',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 4 }}>
                    Share Your Code
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
                    Share your unique referral code with friends and family
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#16a34a',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 4 }}>
                    Friend Signs Up
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
                    They use your code when creating their account
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#16a34a',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 4 }}>
                    Both Get Rewarded
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
                    When they make their first order, both get ₹300 in wallet
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Referral History */}
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                Referral History
              </Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: '#16a34a', fontWeight: '500' }}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 12 }}>
              {referralHistory.slice(0, 3).map((referral) => (
                <View
                  key={referral.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: 4,
                      }}
                    >
                      {referral.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>
                      {referral.email}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View
                      style={{
                        backgroundColor: `${getStatusColor(referral.status)}20`,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: getStatusColor(referral.status),
                        }}
                      >
                        {getStatusText(referral.status)}
                      </Text>
                    </View>
                    {referral.earnings > 0 && (
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#16a34a',
                        }}
                      >
                        +₹{referral.earnings}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Share Options */}
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
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              Share Via
            </Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => copyReferralCode()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: '#f0f9ff',
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
                  WhatsApp & SMS
                </Text>
                <ChevronRight size={20} color="#0ea5e9" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => copyReferralCode()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: '#f0fdf4',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#16a34a',
                }}
              >
                <Mail size={20} color="#16a34a" />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#14532d',
                  }}
                >
                  Email
                </Text>
                <ChevronRight size={20} color="#16a34a" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => copyReferralCode()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: '#fef3c7',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#f59e0b',
                }}
              >
                <QrCode size={20} color="#f59e0b" />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#92400e',
                  }}
                >
                  QR Code
                </Text>
                <ChevronRight size={20} color="#f59e0b" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReferralScreen;
