import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@conch/assets/colors'
import { useReviewList } from '../hooks'
import type { ReviewForList } from '../types'
import DateIcon from './DateIcon'

function formatReviewDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

interface ListItemProps {
  item: ReviewForList
  onPress: () => void
}

function ListItem({ item, onPress }: ListItemProps) {
  const date = new Date(item.reviewDate)
  const day = date.getDate()

  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemContent}>
        <View style={styles.headerRow}>
          <DateIcon day={day} feedbackType={item.feedbackType} size={36} />
          <Text style={styles.dateText}>{formatReviewDate(item.reviewDate)}</Text>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text style={styles.bodyText} numberOfLines={2} ellipsizeMode="tail">
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
    router.push({
      pathname: '/review',
      params: {
        date: item.reviewDate,
        feedbackType: item.feedbackType,
      },
    })
  }

  const renderItem = ({ item }: { item: ReviewForList }) => (
    <ListItem item={item} onPress={() => handleItemPress(item)} />
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

