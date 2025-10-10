import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Smartphone,
  Bell,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Fingerprint,
  QrCode,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  Clock
} from 'lucide-react-native';

interface TwoFAStatus {
  isEnabled: boolean;
  isSetup: boolean;
  backupCodesRemaining: number;
}

interface Device {
  id: string;
  name: string;
  type: string;
  lastUsed: string;
  isTrusted: boolean;
}

interface SecurityAlert {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  created_at: string;
  is_read: boolean;
}

interface EncryptionStatus {
  totalEncrypted: number;
  encryptionEnabled: boolean;
}

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Security status
  const [securityScore, setSecurityScore] = useState(0);
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus>({
    isEnabled: false,
    isSetup: false,
    backupCodesRemaining: 0
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>({
    totalEncrypted: 0,
    encryptionEnabled: false
  });

  // Modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);

  // 2FA states
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFAStep, setTwoFAStep] = useState<'setup' | 'verify' | 'codes' | 'manage'>('setup');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Mock data for demonstration
      setTwoFAStatus({
        isEnabled: false,
        isSetup: false,
        backupCodesRemaining: 0
      });

      setDevices([
        {
          id: '1',
          name: 'iPhone 14 Pro',
          type: 'mobile',
          lastUsed: '2024-01-15T10:30:00Z',
          isTrusted: true
        },
        {
          id: '2',
          name: 'MacBook Pro',
          type: 'desktop',
          lastUsed: '2024-01-14T16:45:00Z',
          isTrusted: true
        },
        {
          id: '3',
          name: 'iPad Air',
          type: 'tablet',
          lastUsed: '2024-01-13T09:15:00Z',
          isTrusted: false
        }
      ]);

      setAlerts([
        {
          id: '1',
          title: 'New device login detected',
          severity: 'medium',
          created_at: '2024-01-15T10:30:00Z',
          is_read: false
        },
        {
          id: '2',
          title: 'Password changed successfully',
          severity: 'low',
          created_at: '2024-01-14T16:45:00Z',
          is_read: true
        },
        {
          id: '3',
          title: 'Suspicious login attempt blocked',
          severity: 'high',
          created_at: '2024-01-13T09:15:00Z',
          is_read: false
        }
      ]);

      setEncryptionStatus({
        totalEncrypted: 1250,
        encryptionEnabled: true
      });

      calculateSecurityScore();
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateSecurityScore = () => {
    let score = 0;
    
    // Base score
    score += 20;
    
    // 2FA enabled
    if (twoFAStatus.isEnabled) score += 30;
    
    // Trusted devices
    if (devices.filter(d => d.isTrusted).length > 0) score += 20;
    
    // Recent alerts handled
    if (alerts.filter(a => !a.is_read).length === 0) score += 15;
    
    // No critical alerts
    if (alerts.filter(a => a.severity === 'high' && !a.is_read).length === 0) score += 15;

    setSecurityScore(Math.min(score, 100));
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSecurityData();
  };

  // 2FA Functions
  const setup2FA = async () => {
    try {
      // Mock setup - in real app this would call the API
      setQrCode('https://via.placeholder.com/200x200/10B981/FFFFFF?text=QR+Code');
      setBackupCodes(['123456', '789012', '345678', '901234', '567890']);
      setTwoFAStep('verify');
    } catch (error) {
      Alert.alert('Error', 'Failed to setup 2FA');
    }
  };

  const verify2FA = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      // Mock verification - in real app this would call the API
      setTwoFAStep('codes');
      setTwoFAStatus({
        isEnabled: true,
        isSetup: true,
        backupCodesRemaining: 5
      });
      Alert.alert('Success', '2FA enabled successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to verify 2FA');
    }
  };

  const disable2FA = async () => {
    Alert.alert(
      'Disable 2FA',
      'Are you sure you want to disable two-factor authentication? This will reduce your account security.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock disable - in real app this would call the API
              setTwoFAStatus({ isEnabled: false, isSetup: false, backupCodesRemaining: 0 });
              setShow2FAModal(false);
              Alert.alert('Success', '2FA disabled successfully');
              loadSecurityData();
            } catch (error) {
              Alert.alert('Error', 'Failed to disable 2FA');
            }
          }
        }
      ]
    );
  };

  // Device Functions
  const trustDevice = async (deviceId: string) => {
    try {
      // Mock trust device - in real app this would call the API
      setDevices(prev => 
        prev.map(d => 
          d.id === deviceId ? { ...d, isTrusted: true } : d
        )
      );
      loadSecurityData();
      Alert.alert('Success', 'Device trusted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to trust device');
    }
  };

  const removeDevice = async (deviceId: string) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this device? You will need to sign in again on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock remove device - in real app this would call the API
              setDevices(prev => prev.filter(d => d.id !== deviceId));
              loadSecurityData();
              Alert.alert('Success', 'Device removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove device');
            }
          }
        }
      ]
    );
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    if (score >= 40) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const getSecurityScoreIcon = (score: number) => {
    if (score >= 80) return ShieldCheck;
    if (score >= 60) return Shield;
    if (score >= 40) return ShieldAlert;
    return ShieldX;
  };

  const SecurityScoreIcon = getSecurityScoreIcon(securityScore);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#f9fafb', 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: insets.top
      }}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
          Loading security status...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ 
        padding: 20, 
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
          Security Center
        </Text>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>
          Manage your account security and privacy
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Security Score */}
        <View style={{ 
          margin: 20, 
          padding: 24, 
          backgroundColor: 'white', 
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: getSecurityScoreColor(securityScore) + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <SecurityScoreIcon size={24} color={getSecurityScoreColor(securityScore)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
                Security Score
              </Text>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: getSecurityScoreColor(securityScore) }}>
                {securityScore}/100
              </Text>
            </View>
          </View>
          
          <View style={{ 
            height: 8, 
            backgroundColor: '#E5E7EB', 
            borderRadius: 4,
            marginBottom: 12
          }}>
            <View style={{ 
              height: '100%', 
              width: `${securityScore}%`, 
              backgroundColor: getSecurityScoreColor(securityScore), 
              borderRadius: 4 
            }} />
          </View>
          
          <Text style={{ fontSize: 14, color: '#6B7280' }}>
            {securityScore >= 80 ? 'Excellent security!' : 
             securityScore >= 60 ? 'Good security, but can be improved' :
             securityScore >= 40 ? 'Moderate security - action recommended' :
             'Low security - immediate action needed'}
          </Text>
        </View>

        {/* Security Features */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Two-Factor Authentication */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => setShow2FAModal(true)}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: twoFAStatus.isEnabled ? '#10B981' : '#EF4444',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Key size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                Two-Factor Authentication
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                {twoFAStatus.isEnabled ? 'Enabled - Extra security active' : 'Disabled - Recommended'}
              </Text>
            </View>
            <View style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 4, 
              borderRadius: 12,
              backgroundColor: twoFAStatus.isEnabled ? '#10B981' : '#EF4444'
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {twoFAStatus.isEnabled ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Trusted Devices */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => setShowDevicesModal(true)}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Smartphone size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                Trusted Devices
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                {devices.length} devices registered
              </Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>
              Manage →
            </Text>
          </TouchableOpacity>

          {/* Security Alerts */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => setShowAlertsModal(true)}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: alerts.some(a => !a.is_read) ? '#F59E0B' : '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Bell size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                Security Alerts
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                {alerts.filter(a => !a.is_read).length} unread alerts
              </Text>
            </View>
            {alerts.some(a => !a.is_read) && (
              <View style={{ 
                width: 20, 
                height: 20, 
                borderRadius: 10, 
                backgroundColor: '#EF4444',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                  {alerts.filter(a => !a.is_read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Data Encryption */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => setShowEncryptionModal(true)}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: encryptionStatus.encryptionEnabled ? '#10B981' : '#6B7280',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Lock size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                Data Encryption
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                {encryptionStatus.encryptionEnabled 
                  ? `${encryptionStatus.totalEncrypted} items encrypted`
                  : 'No encrypted data'
                }
              </Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>
              Manage →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Security Activity */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
            Recent Activity
          </Text>
          
          {alerts.slice(0, 3).map((alert) => (
            <View 
              key={alert.id}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: alert.severity === 'high' ? '#EF4444' : 
                                alert.severity === 'medium' ? '#F59E0B' : '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                {alert.severity === 'high' ? (
                  <AlertTriangle size={16} color="white" />
                ) : alert.severity === 'medium' ? (
                  <Shield size={16} color="white" />
                ) : (
                  <CheckCircle size={16} color="white" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                  {alert.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {new Date(alert.created_at).toLocaleDateString()}
                </Text>
              </View>
              {!alert.is_read && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' }} />
              )}
            </View>
          ))}
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* 2FA Modal */}
      <Modal
        visible={show2FAModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShow2FAModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 20, 
            borderBottomWidth: 1, 
            borderBottomColor: '#E5E7EB',
            backgroundColor: 'white'
          }}>
            <TouchableOpacity onPress={() => setShow2FAModal(false)}>
              <Text style={{ color: '#3B82F6', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
              Two-Factor Authentication
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {!twoFAStatus.isEnabled ? (
              // Setup 2FA Flow
              twoFAStep === 'setup' ? (
                <View>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                    Enable Two-Factor Authentication
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 24 }}>
                    Add an extra layer of security to your account by requiring a verification code from your phone.
                  </Text>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#16A34A',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center'
                    }}
                    onPress={setup2FA}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Get Started
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : twoFAStep === 'verify' ? (
                <View>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                    Scan QR Code
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 24 }}>
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </Text>
                  
                  {qrCode && (
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                      <Image 
                        source={{ uri: qrCode }} 
                        style={{ width: 200, height: 200, borderRadius: 12 }}
                      />
                    </View>
                  )}
                  
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                    Enter Verification Code
                  </Text>
                  <TextInput
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="000000"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      textAlign: 'center',
                      marginBottom: 24
                    }}
                  />
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#16A34A',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center'
                    }}
                    onPress={verify2FA}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Verify & Enable
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : twoFAStep === 'codes' ? (
                <View>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                    Save Your Backup Codes
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 24 }}>
                    Store these backup codes in a safe place. You can use them to access your account if you lose your phone.
                  </Text>
                  
                  <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                    {backupCodes.map((code, index) => (
                      <Text key={index} style={{ 
                        fontSize: 16, 
                        fontFamily: 'monospace', 
                        textAlign: 'center',
                        marginBottom: 8
                      }}>
                        {code}
                      </Text>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#16A34A',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center'
                    }}
                    onPress={() => {
                      setShow2FAModal(false);
                      setTwoFAStep('setup');
                      loadSecurityData();
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            ) : (
              // Manage 2FA
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                  Manage 2FA
                </Text>
                <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 24 }}>
                  Two-factor authentication is currently enabled for your account.
                </Text>
                
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                    Backup Codes Remaining
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16A34A' }}>
                    {twoFAStatus.backupCodesRemaining || 0}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#EF4444',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                  onPress={disable2FA}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Disable 2FA
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Additional modals for Devices, Alerts, and Encryption would go here */}
    </View>
  );
}
