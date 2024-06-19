import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, push } from 'firebase/database';
import { auth } from "../firebase-config.js";

const RatingComponent = ({ stopId, onRatingChange }) => {
  const [rating, setRating] = useState(0);

  const handleRating = async (rate) => {
    setRating(rate);
    if (onRatingChange) {
      onRatingChange(rate);
    }

    // Save rating to Firebase Realtime Database under the specific stop ID
    try {
        const db = getDatabase();
      const ratingsRef = ref(db, `stops/${stopId}/ratings`);
      await push(ratingsRef, {
        rating: rate,
        timestamp: new Date().toISOString(),
      });
      console.log('Rating added to Firebase for stop:', stopId);
    } catch (error) {
      console.error('Error adding rating to Firebase:', error);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => handleRating(item)}
        >
          <Icon
            name="star"
            size={40}
            color={item <= rating ? '#FFD700' : '#D3D3D3'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});

export default RatingComponent;
