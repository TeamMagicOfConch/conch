import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { Colors } from '@conch/assets/colors'
import { TimePickerProps } from './types'

const TimePicker = ({
  visible,
  onClose,
  onConfirm,
  selectedTime,
  setSelectedTime,
  selectedOption,
}: TimePickerProps) => {
  const confirmTime = () => {
    onConfirm(selectedTime)
    onClose()
  }

  // 선택된 옵션에 따라 타이틀 텍스트 설정
  const getTitleText = () => {
    switch(selectedOption) {
      case 'after_work':
        return '퇴근 직후,'
      case 'before_sleep':
        return '잠들기 직전,'
      case 'after_dinner':
        return '저녁 식사 후,'
      case 'custom':
        return '시간 선택,'
      default:
        return '시간 선택,'
    }
  }

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
            <View style={styles.drawerHandleContainer}>
              <View style={styles.drawerHandle} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getTitleText()}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerContainer}>
              {/* 피커 위치 조정 */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerItem}>오전</Text>
                <Text style={[styles.pickerItem, styles.pickerItemSelected]}>오후</Text>
                <Text style={styles.pickerItem}>오전</Text>
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
  )
}

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
  drawerHandleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  drawerHandle: {
    width: 60,
    height: 3,
    backgroundColor: '#999FA3',
    borderRadius: 1.5,
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
    color: '#000000',
  },
  closeButtonContainer: {
    opacity: 0.7,
    padding: 4,
  },
  closeButton: {
    fontSize: 24,
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
    gap: 10,
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
    borderRadius: 200,
    padding: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default TimePicker 