import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  useColorScheme,
  ImageBackground,
} from "react-native";

import backgroundIMGL from "./Images/bgIMGnew.png";
import backgroundIMGD from "./Images/bgIMGD.png";
import searchL from "./Images/search.png";
import searchD from "./Images/searchD.png";
import axios from "axios";

export default function App() {
  const [textClr, setTextClr] = useState("white");
  const [bgClr, setBgClr] = useState("rgba(0,0,0,0.5)");
  const [bgImg, setBgImg] = useState(backgroundIMGD);
  const [searchImg, setSearchImg] = useState(searchD);
  const [shadowColor, setShadowColor] = useState("white");
  const [location, setLocation] = useState("");
  const [risk, setRisk] = useState("0%");
  const [uv, setUv] = useState("0");
  const [uvMax, setUvMax] = useState("0");
  const [maxTime, setMaxTime] = useState("0");
  const [adress, setAdress] = useState("");
  const [safe, setSafe] = useState("");
  const [visible, setVisible] = useState("none");
  const [safeAreaBg, setSafeAreaBg] = useState("black");
  const cardOpacity = useState(new Animated.Value(0))[0];

  const colorScheme = useColorScheme();

  useEffect(() => {
    changeTheme(colorScheme);
  }, []);

  const changeTheme = (colorScheme) => {
    const toLightMode = colorScheme === "light";

    setBgImg(toLightMode ? backgroundIMGL : backgroundIMGD);
    setSafeAreaBg(toLightMode ? "white" : "black");
    setTextClr(toLightMode ? "black" : "white");
    setBgClr(toLightMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)");
    setSearchImg(toLightMode ? searchL : searchD);
    setShadowColor(toLightMode ? "black" : "white");
  };

  const fetchData = async () => {
    if (location === "" || location.length < 3) {
      return;
    }
    try {
      const APIkey = "7e9112dfaada39cf58c77ebb5a9525ee";
      const Api = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${APIkey}`;
      const response = await axios.get(Api);
      setLocation("");

      const lat = response.data.find(e=>e.lat !== null).lat;
      const lon = response.data.find(e=>e.lon !== null).lon;

    const uvResp =  await axios.get(`https://api.openuv.io/api/v1/uv?lat=${lat}.5&lng=${lon}.11&alt=100&dt=`, {
        headers: {
          'x-access-token': 'openuv-1cs4ds2rltvwv0o1-io',
          'Content-Type': 'application/json'
        },
        redirect: 'follow'
      
      }).then(
        response => response.data
      ).
      catch((error) => {
        console.log(error);
      });

      
      
      const rick = (uvResp.result.uv * 100) / 11
      setRisk(rick > 94.4 ? '94.4%' : rick.toString() + '%');
      setAdress(response.data[0].name);
      setUv(uvResp.result.uv);
      setUvMax(uvResp.result.uv_max);
      const MxTime =
        uvResp.result.uv_max_time.split("T")[1].split(":")[0] +
        ":" +
        uvResp.result.uv_max_time.split("T")[1].split(":")[1];
      setMaxTime(MxTime);

      const safe =
        uvResp.result.uv < 3
          ? "Noice Weather 😎"
          : uvResp.result.uv < 6
          ? "Moderate 🙂"
          : uvResp.result.uv < 8
          ? "High 💀"
          : "Very High ☠️";
      setSafe(safe);
      setVisible("flex");

      // Animate the card when new data is fetched
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } catch(e) {
      alert("Invalid Location");
      setVisible("none");
      cardOpacity.setValue(0); // Reset the card opacity when an error occurs
    }
  };


  const card = () => {
    return (
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          display: visible,
          opacity: cardOpacity,
        }}
      >
        <Text style={[styles.fontStyles, { color: textClr, marginTop: 20 }]}>
          {adress}
        </Text>
        <View style={styles.riskMeter}>
          <LinearGradient
            colors={["green", "yellow", "red"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: risk, //max 94.4% min 0%
              width: 20,
              height: "100%",
              zIndex: 2,
              borderWidth: 4,
              borderColor: "white",
              borderRadius: 50,
            }}
          ></View>
        </View>
        <View
          style={{
            width: "80%",
            height: "30%",
            justifyContent: "center",
            alignItems: "flex-start",
            elevation: 5,
            marginTop: 50,
          }}
        >
          <Text style={[styles.fontStyles, { color: textClr, marginTop: 10 }]}>
            UV Index: {uv}
          </Text>
          <Text style={[styles.fontStyles, { color: textClr, marginTop: 20 }]}>
            Max UV Index: {uvMax}
          </Text>
          <Text style={[styles.fontStyles, { color: textClr, marginTop: 10 }]}>
            Max UV Index Time: {maxTime}
          </Text>
          <Text
            style={[
              styles.fontStyles,
              { color: textClr, marginTop: 30, fontSize: 30 },
            ]}
          >
            {safe}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeAreaBg }]}>
      <ImageBackground
        style={{
          height: "80%",
          width: "100%",
        }}
        source={bgImg}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback
          onPress={() => Keyboard.dismiss()}
          style={{ width: "100%", height: "100%" }}
        >
          <SafeAreaView style={[styles.safeArea, { backgroundColor: bgClr }]}>
            <View style={[styles.searchBar]}>
              <TextInput
                style={[styles.input, { color: textClr }]}
                placeholder="Search"
                placeholderTextColor={textClr}
                value={location}
                onChangeText={(text) => setLocation(text)}
                onSubmitEditing={fetchData}
              />
              <TouchableOpacity onPress={fetchData} style={styles.searchBtn}>
                <Image source={searchImg} style={{ width: 40, height: 40 }} />
              </TouchableOpacity>
            </View>
            {card()}
          </SafeAreaView>
        </TouchableWithoutFeedback>
        <StatusBar style="auto" />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    position: "relative",
    height: "100%",
    width: "100%",
  },
  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
    top: 0,
    left: 0,
  },
  input: {
    height: "100%",
    width: "80%",
    margin: 12,
    padding: 10,
    fontSize: 20,
    fontWeight: "bold",
    borderRadius: 5,
    backgroundColor: "transparent",
  },
  searchBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "95%",
    height: 50,
    borderRadius: 40,
  },
  searchBtn: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
    height: "100%",
  },
  safeArea: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  riskMeter: {
    width: "90%",
    height: 20,
    borderRadius: 10,
    marginTop: 40,
    overflow: "hidden",
    position: "relative",
  },
  gradient: {
    flex: 1,
  },
  fontStyles: {
    fontSize: 20,
    fontWeight: "bold",
  },
});