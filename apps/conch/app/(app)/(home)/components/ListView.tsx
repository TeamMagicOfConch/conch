import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@conch/assets/colors'
import { useReviewList } from '../hooks'
import type { ReviewForList } from '../types'
import DateIcon from './DateIcon'

function getReviewDateObject(dateString: string): { year: number, month: number, day: number } {
  const date = new Date(dateString)
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  }
}

interface ListItemProps {
  item: ReviewForList
  index: number
  onPress: () => void
}

function ListItem({ item, index, onPress }: ListItemProps) {
  const { year, month, day } = getReviewDateObject(item.reviewDate)
  return (
    <Pressable
      style={styles.listItem}
      onPress={onPress}>
      <View style={styles.listItemContent}>
        <View style={styles.headerRow}>
          <DateIcon
            day={index + 1}
            type={item.feedbackType}
            size={36}
          />
          <Text style={styles.dateText}>{`${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`}</Text>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text
            style={styles.bodyText}
            numberOfLines={2}
            ellipsizeMode="tail">
            {item.body}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function ListView() {
  const { reviews, isLoading, isRefreshing, loadMore, refresh, hasMore } = useReviewList()
  const router = useRouter()
  const { width, height } = useWindowDimensions()

  const handleItemPress = (item: ReviewForList) => {
    const { year, month, day } = getReviewDateObject(item.reviewDate)
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    router.push({
      pathname: '/review',
      params: {
        date,
        feedbackType: item.feedbackType,
      },
    })
  }

  const renderItem = ({ item, index }: { item: ReviewForList, index: number }) => (
    <ListItem
      item={item}
      index={index}
      onPress={() => handleItemPress(item)}
    />
  )

  const renderFooter = () => {
    if (!isLoading || reviews.length === 0) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Colors.lightGrey} />
      </View>
    )
  }

  const renderEmpty = () => {
    if (isLoading && reviews.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={Colors.lightGrey} />
        </View>
      )
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>작성된 리뷰가 없습니다</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={reviews}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.reviewDate}-${index}`}
      onEndReached={() => {
        if (hasMore && !isLoading) {
          loadMore()
        }
      }}
      onEndReachedThreshold={0.5}
      refreshing={isRefreshing}
      onRefresh={refresh}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        styles.listContent,
        {
          paddingHorizontal: width * 0.06,
          paddingTop: height * 0.025,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    marginBottom: 20,
  },
  listItemContent: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.writtenGrey,
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.lightGrey,
  },
  bodyRow: {
    paddingLeft: 48,
  },
  bodyText: {
    fontSize: 15,
    color: Colors.writtenGrey,
    lineHeight: 21,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.lightGrey,
  },
})

