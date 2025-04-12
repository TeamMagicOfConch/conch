import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@conch/assets/colors';
import { TimePickerProps } from './types';

const TimePicker = ({
  visible,
  onClose,
  onConfirm,
  selectedTime,
  setSelectedTime,
}: TimePickerProps) => {
  const confirmTime = () => {
    onConfirm(selectedTime);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTime}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerContainer}>
              {/* 여기에 휠 피커 구현 (간단한 UI로 대체) */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerItem}>오전</Text>
                <Text style={[styles.pickerItem, styles.pickerItemSelected]}>오후</Text>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerItem}>11</Text>
                <Text style={[styles.pickerItem, styles.pickerItemSelected]}>12</Text>
                <Text style={styles.pickerItem}>1</Text>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerItem}>20</Text>
                <Text style={[styles.pickerItem, styles.pickerItemSelected]}>30</Text>
                <Text style={styles.pickerItem}>40</Text>
              </View>
            </View>
            <View style={styles.pickerSelectionIndicator} />
            <TouchableOpacity style={styles.confirmButton} onPress={confirmTime}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  modalBlur: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.7,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 160,
  },
  pickerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  pickerItem: {
    fontSize: 24,
    padding: 10,
    color: '#000000',
    opacity: 0.3,
  },
  pickerItemSelected: {
    fontSize: 28,
    fontWeight: 'bold',
    opacity: 1,
  },
  pickerSelectionIndicator: {
    position: 'absolute',
    left: 50,
    right: 50,
    height: 40,
    top: '50%',
    marginTop: -5,
    backgroundColor: Colors.bgGrey,
    opacity: 0.1,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#F9842A',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    marginTop: 40,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TimePicker; 