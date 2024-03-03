import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CalendarScreen, ViewReviewScreen, WriteReviewScreen } from './screens'

const Stack = createNativeStackNavigator()

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Review"
          component={ViewReviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WriteReview"
          component={WriteReviewScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
