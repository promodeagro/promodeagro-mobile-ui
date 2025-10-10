import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
import { MessageSquare, Edit3, X, Clock, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function DeliveryInstructionsSection({ 
  deliveryInstructions = '',
  onInstructionsChange,
  expressDelivery = false,
  onExpressDeliveryToggle 
}: {
  deliveryInstructions?: string;
  onInstructionsChange?: (instructions: string) => void;
  expressDelivery?: boolean;
  onExpressDeliveryToggle?: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [tempInstructions, setTempInstructions] = useState(deliveryInstructions);
  const insets = useSafeAreaInsets();

  const handleSave = () => {
    if (onInstructionsChange) {
      onInstructionsChange(tempInstructions);
    }
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempInstructions(deliveryInstructions);
    setShowModal(false);
  };

  const quickInstructions = [
    "Leave at door",
    "Ring doorbell",
    "Call on arrival", 
    "Hand to me personally",
    "Leave with security",
    "Use elevator"
  ];

  return (
    <>
      <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <MessageSquare size={20} color="#8B5CF6" />
          <Text style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginLeft: 8,
          }}>
            Delivery Preferences
          </Text>
        </View>

        {/* Express Delivery Toggle */}
        <TouchableOpacity
          onPress={onExpressDeliveryToggle}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: expressDelivery ? '#fef3c7' : '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: expressDelivery ? 2 : 1,
            borderColor: expressDelivery ? '#f59e0b' : '#e5e7eb'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{
              backgroundColor: expressDelivery ? '#f59e0b' : '#6b7280',
              borderRadius: 8,
              padding: 8,
              marginRight: 12
            }}>
              <Zap size={16} color="white" fill="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: expressDelivery ? '#92400e' : '#111827',
                marginBottom: 2
              }}>
                Express Delivery
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: expressDelivery ? '#a16207' : '#6b7280'
              }}>
                {expressDelivery ? 'Deliver within 1 hour' : 'Get it delivered faster (+₹29)'}
              </Text>
            </View>
          </View>
          
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: expressDelivery ? '#f59e0b' : '#d1d5db',
            backgroundColor: expressDelivery ? '#f59e0b' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {expressDelivery && (
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: 'white'
              }} />
            )}
          </View>
        </TouchableOpacity>

        {/* Delivery Instructions */}
        <View style={{
          backgroundColor: '#f8f9fa',
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 12 
          }}>
            <Text style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#111827"
            }}>
              Special Instructions
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                backgroundColor: '#6366f1',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Edit3 size={14} color="white" />
              <Text style={{
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                color: "white",
                marginLeft: 4
              }}>
                {deliveryInstructions ? 'Edit' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: deliveryInstructions ? "#374151" : "#9ca3af",
            lineHeight: 20
          }}>
            {deliveryInstructions || "Add any special delivery instructions for your delivery partner"}
          </Text>
        </View>

        {/* Quick Time Slots for Express */}
        {expressDelivery && (
          <View style={{ marginTop: 16 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#111827",
              marginBottom: 12
            }}>
              Express Delivery Times
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Within 30 mins', 'Within 1 hour', 'ASAP'].map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: index === 0 ? '#6366f1' : 'white',
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: index === 0 ? '#6366f1' : '#d1d5db',
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Clock size={12} color={index === 0 ? 'white' : '#6b7280'} />
                  <Text style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: index === 0 ? 'white' : '#6b7280',
                    marginLeft: 4
                  }}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Instructions Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          paddingTop: insets.top
        }}>
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
              fontFamily: "Inter_700Bold",
              color: '#111827'
            }}>
              Delivery Instructions
            </Text>
            <TouchableOpacity onPress={handleCancel}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, padding: 20 }}>
            {/* Quick Options */}
            <Text style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: '#111827',
              marginBottom: 12
            }}>
              Quick Options
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: 8, 
              marginBottom: 24 
            }}>
              {quickInstructions.map((instruction, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setTempInstructions(instruction)}
                  style={{
                    backgroundColor: tempInstructions === instruction ? '#6366f1' : 'white',
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: tempInstructions === instruction ? '#6366f1' : '#d1d5db'
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: tempInstructions === instruction ? 'white' : '#374151'
                  }}>
                    {instruction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Instructions */}
            <Text style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: '#111827',
              marginBottom: 12
            }}>
              Custom Instructions
            </Text>
            <TextInput
              value={tempInstructions}
              onChangeText={setTempInstructions}
              placeholder="Enter any special instructions for your delivery partner..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#d1d5db',
                textAlignVertical: 'top',
                marginBottom: 20
              }}
            />

            {/* Examples */}
            <View style={{
              backgroundColor: '#eff6ff',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#bfdbfe'
            }}>
              <Text style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: '#1e40af',
                marginBottom: 8
              }}>
                💡 Examples
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: '#3730a3',
                lineHeight: 18
              }}>
                • "Please ring the doorbell twice"{'\n'}
                • "Leave with the building security"{'\n'}
                • "Call me when you arrive, I'll come down"{'\n'}
                • "Apartment is on the 3rd floor, no elevator"
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ padding: 20, backgroundColor: 'white' }}>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: '#6366f1',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontFamily: "Inter_600SemiBold"
              }}>
                Save Instructions
              </Text>                             
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                alignItems: 'center',
                paddingVertical: 12
              }}
            >
              <Text style={{
                color: '#6b7280',
                fontSize: 14,
                fontFamily: "Inter_500Medium"
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
