import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  // KeyboardAvoidingView,
  // ScrollView,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { Todo, TodoFormData } from '../../types/todo.types';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatDateTime } from '../../utils/dateHelpers';
//for optimized keyboard-aware-scroll
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface TodoFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: TodoFormData) => void;
  editingTodo?: Todo | null;
}

/**
 * TodoForm Component
 * Modal form for creating and editing todos
 * Includes validation and date/time picker
 */
const TodoForm: React.FC<TodoFormProps> = ({
  isVisible,
  onClose,
  onSubmit,
  editingTodo,
}) => {
  const theme = useThemeStore((state) => state.mode);
  const isDark = theme === 'dark';

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    location: '',
  });

  /**
   * Populate form when editing
   */
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      setLocation(editingTodo.location);
      setDateTime(new Date(editingTodo.dateTime));
    } else {
      resetForm();
    }
  }, [editingTodo, isVisible]);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setDateTime(new Date());
    setErrors({ title: '', description: '', location: '' });
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors = { title: '', description: '', location: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData: TodoFormData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      dateTime: dateTime.toISOString(),
    };

    onSubmit(formData);
    resetForm();
    onClose();
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Handle date change
   */
  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  /**
   * Handle time change
   */
  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDateTime(selectedTime);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      // ✅ Critical props for smooth keyboard handling
      avoidKeyboard={true}
      statusBarTranslucent={true}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      // ✅ Optimize animation performance
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={300}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={300}
      // ✅ Position modal properly
      style={{
        margin: 0,
        justifyContent: 'flex-end',
      }}
    >
      <View
        className={`rounded-t-3xl ${
          isDark ? 'bg-bg-primary' : 'bg-bg-light-primary'
        }`}
        style={{
          maxHeight: Dimensions.get('window').height * 0.92,
        }}
      >
        {/* Header - Fixed at top */}
        <View className="px-6 pt-6 pb-4 border-b-2 border-text-secondary/20">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-2xl font-bold font-mono ${
                isDark ? 'text-text-primary' : 'text-text-light-primary'
              }`}
            >
              {editingTodo ? 'Edit Todo' : 'Add New Todo'}
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Ionicons
                name="close"
                size={28}
                color={isDark ? '#d1d0c5' : '#323437'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Form Content with Keyboard Awareness */}
        <KeyboardAwareScrollView
          // ✅ Critical props for smooth keyboard handling
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // ✅ Smooth scroll behavior
          bounces={true}
          bouncesZoom={false}
          // ✅ Performance optimization
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 32,
          }}
        >
          {/* Title Input */}
          <Input
            label="Title"
            placeholder="Enter todo title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            required
            maxLength={100}
            autoCapitalize="sentences"
            returnKeyType="next"
          />

          {/* Description Input */}
          <Input
            label="Description"
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            required
            multiline
            numberOfLines={4}
            maxLength={500}
            autoCapitalize="sentences"
            returnKeyType="next"
            style={{
              minHeight: 100,
              textAlignVertical: 'top',
              paddingTop: 12,
            }}
          />

          {/* Location Input */}
          <Input
            label="Location"
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
            error={errors.location}
            required
            maxLength={200}
            autoCapitalize="words"
            returnKeyType="done"
          />

          {/* Date & Time Pickers */}
          <View className="mb-4">
            <Text
              className={`mb-2 text-sm font-medium ${
                isDark ? 'text-text-primary' : 'text-text-light-primary'
              }`}
            >
              Date & Time <Text className="text-error">*</Text>
            </Text>

            <View className="flex-row gap-3">
              {/* Date Button */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className={`flex-1 flex-row items-center justify-between rounded-lg border-2 border-text-secondary px-4 py-3 ${
                  isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-mono ${
                    isDark ? 'text-text-primary' : 'text-text-light-primary'
                  }`}
                >
                  {dateTime.toLocaleDateString()}
                </Text>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={isDark ? '#e2b714' : '#d97706'}
                />
              </TouchableOpacity>

              {/* Time Button */}
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className={`flex-1 flex-row items-center justify-between rounded-lg border-2 border-text-secondary px-4 py-3 ${
                  isDark ? 'bg-bg-secondary' : 'bg-bg-light-secondary'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-mono ${
                    isDark ? 'text-text-primary' : 'text-text-light-primary'
                  }`}
                >
                  {dateTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons
                  name="time"
                  size={20}
                  color={isDark ? '#e2b714' : '#d97706'}
                />
              </TouchableOpacity>
            </View>

            {/* Display Selected Date/Time */}
            <Text
              className={`mt-2 text-xs font-mono ${
                isDark ? 'text-text-secondary' : 'text-text-light-secondary'
              }`}
            >
              Selected: {formatDateTime(dateTime.toISOString())}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="mt-6 flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={handleClose}
              />
            </View>
            <View className="flex-1">
              <Button
                title={editingTodo ? 'Update' : 'Add Todo'}
                variant="primary"
                onPress={handleSubmit}
              />
            </View>
          </View>

          {/* Extra padding at bottom for keyboard */}
          <View style={{ height: 40 }} />
        </KeyboardAwareScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dateTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            textColor={isDark ? '#d1d0c5' : '#323437'}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={dateTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
            textColor={isDark ? '#d1d0c5' : '#323437'}
          />
        )}
      </View>
    </Modal>
  );
};

export default React.memo(TodoForm);
