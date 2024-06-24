import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const VeziStatie = ({ route }) => {
  const [ratingsData, setRatingsData] = useState([]);
  const { lat, lng, stop_name, stop_id } = route.params;
  const apiKey = 'AIzaSyANusx15v_PhIIfm5wUOchee7ayMMqkYcs';
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${lat},${lng}&key=${apiKey}`;

  const fetchRatingsData = () => {
    const db = getDatabase();
    const ratingsRef = ref(db, `stops/${stop_id}/ratings`);
    
    onValue(ratingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ratings = Object.values(data);
        setRatingsData(ratings);
      } else {
        setRatingsData([]);
      }
    }, {
      onlyOnce: true
    });
  };

  useEffect(() => {
    fetchRatingsData();
  }, []);

  const processDataForChart = () => {
    const hourlyRatings = new Array(24).fill(0);

    ratingsData.forEach(({ rating, timestamp }) => {
      const hour = new Date(timestamp).getHours(); 
      hourlyRatings[hour] += rating; 
    });

    return hourlyRatings;
  };

  const chartData = {
    labels:Array.from({ length: 18 }, (_, i) => `${i + 6}`), 
    datasets: [
      {
        data: processDataForChart(),
      },
    ],
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor: "white" }} >
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{stop_name}</Text>
      <View style={styles.imageContainer}>
        <Image source={{ uri: streetViewUrl }} style={styles.streetViewImage} />
      </View>
      <Text style={styles.chartTitle}>Gradul de aglomerare pe ore</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForBars: {
            strokeWidth: 2,
            stroke: '#ffa726',
          },
          barPercentage: 0.4, 
          categoryPercentage: 0.6, 
        }}
        style={styles.chart}
      />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 35,
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  streetViewImage: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
});

export default VeziStatie;
