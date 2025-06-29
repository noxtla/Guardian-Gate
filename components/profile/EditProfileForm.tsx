// components/profile/EditProfileForm.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { globalStyles } from '@/constants/AppStyles';

interface UserData {
  Name: string;
  Position: string;
  Email: string;
  PhoneNumber: string;
}

interface EditProfileFormProps {
  userData: UserData;
  onSave: (updatedData: UserData) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ userData, onSave }) => {
  const [name, setName] = useState(userData.Name);
  const [position, setPosition] = useState(userData.Position);
  const [email, setEmail] = useState(userData.Email);
  const [phoneNumber, setPhoneNumber] = useState(userData.PhoneNumber);

  const handleSave = () => {
    const updatedData: UserData = {
      Name: name,
      Position: position,
      Email: email,
      PhoneNumber: phoneNumber,
    };
    onSave(updatedData);
    Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <View style={globalStyles.editProfileFormContainer}>
      <View style={globalStyles.formInputGroup}>
        <ThemedText style={globalStyles.formLabel}>Full Name</ThemedText>
        <TextInput
          style={globalStyles.formTextInput}
          value={name}
          onChangeText={setName}
          placeholder="Enter full name"
          placeholderTextColor={globalStyles.formTextInput.color}
        />
      </View>

      <View style={globalStyles.formInputGroup}>
        <ThemedText style={globalStyles.formLabel}>Position</ThemedText>
        <TextInput
          style={globalStyles.formTextInput}
          value={position}
          onChangeText={setPosition}
          placeholder="Enter position"
          placeholderTextColor={globalStyles.formTextInput.color}
        />
      </View>

      <View style={globalStyles.formInputGroup}>
        <ThemedText style={globalStyles.formLabel}>Email</ThemedText>
        <TextInput
          style={globalStyles.formTextInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor={globalStyles.formTextInput.color}
          keyboardType="email-address"
        />
      </View>

      <View style={globalStyles.formInputGroup}>
        <ThemedText style={globalStyles.formLabel}>Phone Number</ThemedText>
        <TextInput
          style={globalStyles.formTextInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          placeholderTextColor={globalStyles.formTextInput.color}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[globalStyles.primaryButton, globalStyles.formSaveButton]}
        onPress={handleSave}
      >
        <ThemedText style={globalStyles.primaryButtonText}>Save Changes</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileForm;