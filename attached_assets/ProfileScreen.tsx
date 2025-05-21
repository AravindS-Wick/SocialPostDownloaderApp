import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Button, Avatar, Divider, Card, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateProfile } from '../store/slices/authSlice';
import { RootState } from '../store';

const ProfileScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    dispatch(updateProfile({
      displayName,
      email,
    }));
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Surface style={[styles.profileHeader, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.profileImageContainer}>
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.profileImage}
            />
          ) : (
            <Avatar.Text
              size={100}
              label={(user?.displayName || user?.username || 'User').substring(0, 2)}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.onPrimaryContainer}
            />
          )}
          
          <TouchableOpacity style={styles.editImageButton}>
            <MaterialCommunityIcons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.username}>@{user?.username || 'user'}</Text>
      </Surface>

      <View style={styles.profileContent}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Personal Information
              </Text>
              {!isEditing ? (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => setIsEditing(true)}
                />
              ) : null}
            </View>
            
            <Divider style={styles.divider} />
            
            {isEditing ? (
              <>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Display Name</Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    mode="outlined"
                    style={styles.input}
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                  />
                </View>
                
                <View style={styles.editButtonsContainer}>
                  <Button 
                    mode="outlined" 
                    onPress={handleCancelEdit}
                    style={styles.editButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSaveProfile}
                    style={styles.editButton}
                  >
                    Save
                  </Button>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Display Name</Text>
                  <Text style={styles.infoValue}>{user?.displayName || 'Not set'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>@{user?.username || 'user'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>User ID</Text>
                  <Text style={styles.infoValue}>{user?.id || 'Unknown'}</Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Account Statistics
            </Text>
            
            <Divider style={styles.divider} />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Downloads</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Platforms</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>415 MB</Text>
                <Text style={styles.statLabel}>Total Size</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Connected Platforms
            </Text>
            
            <Divider style={styles.divider} />
            
            <View style={styles.platformList}>
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="youtube" size={24} color="#FF0000" />
                <Text style={styles.platformName}>YouTube</Text>
                <Text style={styles.platformStatus}>Connected</Text>
              </View>
              
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="instagram" size={24} color="#E1306C" />
                <Text style={styles.platformName}>Instagram</Text>
                <Text style={styles.platformStatus}>Not connected</Text>
              </View>
              
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="twitter" size={24} color="#1DA1F2" />
                <Text style={styles.platformName}>Twitter</Text>
                <Text style={styles.platformStatus}>Not connected</Text>
              </View>
            </View>
            
            <Button 
              mode="outlined" 
              onPress={() => {}}
              icon="connection"
              style={{ marginTop: 12 }}
            >
              Manage Connections
            </Button>
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={handleLogout}
          icon="logout"
          textColor={theme.colors.error}
          style={styles.logoutButton}
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  profileContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  platformList: {
    marginVertical: 8,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformName: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  platformStatus: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    marginTop: 8,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  input: {
    backgroundColor: 'transparent',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  editButton: {
    marginLeft: 8,
  },
});

export default ProfileScreen;