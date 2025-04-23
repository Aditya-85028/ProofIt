import { Link, Stack } from "expo-router";
import { StyleSheet, Image, View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text>This screen doesn't exist.</Text>
      <Link href="/" style={styles.link}>
        <Image
          source={require("../assets/images/not-found.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text>Go to home screen!</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
