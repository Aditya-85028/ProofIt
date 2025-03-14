import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

const Profile = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={require("@/assets/images/not-found.png")} style={styles.avatar} />
        <Text style={styles.username}>Imran Haidery</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>My Progress</Text>
      </View>

      {/* Image Gallery */}
      <View style={styles.gallery}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={styles.imageContainer}>
            <Image source={require("@/assets/images/adi.png")} style={styles.galleryImage} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f3f3f3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressSection: {
    marginBottom: 16,
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  imageContainer: {
    width: "30%",
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default Profile;
