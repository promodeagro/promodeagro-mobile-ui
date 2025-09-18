import { Image } from "expo-image";
import { Tag } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_SPACING = 12; // Spacing between slides
const HORIZONTAL_PADDING = 20; // Padding on each side
const CARD_WIDTH = width - (HORIZONTAL_PADDING * 2); // Card width accounting for padding

export function OffersSliderSection({ offers }: { offers: any[] }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0));

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < offers.length - 1) {
        const nextIndex = currentIndex + 1;
        scrollToIndex(nextIndex);
      } else {
        // Reset to first slide
        scrollToIndex(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, offers.length]);

  const scrollToIndex = (index: number) => {
    const x = index * (CARD_WIDTH + CARD_SPACING);
    scrollViewRef.current?.scrollTo({ x, animated: true });
    setCurrentIndex(index);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX.current } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
        setCurrentIndex(index);
      },
    }
  );

  const renderOfferCard = (item: any, index: number) => (
    <View
      key={index}
      style={{
        width: CARD_WIDTH,
        marginRight: index < offers.length - 1 ? CARD_SPACING : 0,
      }}
    >
        <View
          style={{
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
            width: "100%",
            // Web-specific fixes
            ...(typeof window !== 'undefined' && {
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }),
          }}
        >
          <View style={{ 
            position: "relative", 
            height: 160, 
            width: "100%",
            overflow: "hidden" 
          }}>
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              // Web-specific image fixes
              ...(typeof window !== 'undefined' && {
                objectFit: 'cover',
                display: 'block',
              }),
            }}
            contentFit="cover"
            placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            transition={300}
          />
        </View>
      </View>
    </View>
  );

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 32, marginTop: 20 }}>
      {/* Section Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Tag size={20} color="#8B5CF6" />
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginLeft: 8,
            }}
          >
            Great Offers
          </Text>
        </View>
      </View>

      {/* Custom Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
        }}
      >
        {offers.map((offer, index) => renderOfferCard(offer, index))}
      </ScrollView>

      {/* Pagination dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        {offers.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === currentIndex ? "#8B5CF6" : "#E5E7EB",
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
}
