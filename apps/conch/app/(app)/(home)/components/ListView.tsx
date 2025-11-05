import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SoraBg } from '@conch/assets/icons'
import { Colors } from '@conch/assets/colors'
import { useReviewList } from '../hooks'
import type { ReviewForList } from '../types'

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
  const isFReview = item.feedbackType === 'FEELING'

  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemContent}>
        <Text style={styles.dateText}>{formatReviewDate(item.reviewDate)}</Text>
        <View style={styles.itemBody}>
          <View style={styles.iconContainer}>
            <SoraBg
              color={isFReview ? Colors.fSora : Colors.tSora}
              width={32}
              height={32}
            />
          </View>
          <Text style={styles.bodyText} numberOfLines={2} ellipsizeMode="tail">
            {item.body}
          </Text>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function ListView() {
  const { reviews, isLoading, isRefreshing, loadMore, refresh, hasMore } = useReviewList()
  const router = useRouter()

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
      contentContainerStyle={styles.listContent}
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listItem: {
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey + '20',
  },
  listItemContent: {
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: Colors.lightGrey,
    marginBottom: 4,
  },
  itemBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyText: {
    flex: 1,
    fontSize: 14,
    color: Colors.writtenGrey,
    lineHeight: 20,
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.lightGrey,
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

