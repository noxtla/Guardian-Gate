// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, useWindowDimensions, View, TouchableOpacity } from 'react-native'; // Añadir TouchableOpacity
import { useEffect } from 'react'; // <-- Añadir useEffect

// Importaciones de reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// --- NUEVO COMPONENTE: CustomTabBarContainer ---
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { width } = useWindowDimensions();
  const TAB_BAR_HEIGHT = 80; // Altura del tab bar
  const NUMBER_OF_TABS = state.routes.length;
  const TAB_ITEM_WIDTH = width / NUMBER_OF_TABS; // Ancho igual para cada ítem de tab

  // Valores compartidos para la posición y ancho de la píldora animada
  const translateX = useSharedValue(0);
  const pillWidth = useSharedValue(TAB_ITEM_WIDTH);

  // Animación de la píldora al cambiar de pestaña
  useEffect(() => {
    const activeTab = state.routes[state.index];
    const targetX = state.index * TAB_ITEM_WIDTH; // Calcular la posición X de la píldora
    // Podemos ajustar el `pillWidth` si queremos que la píldora sea más estrecha que el ítem del tab.
    // Por ahora, lo mantenemos igual que TAB_ITEM_WIDTH.
    
    translateX.value = withTiming(targetX, { duration: 300, easing: Easing.out(Easing.quad) });
    // pillWidth.value = withTiming(TAB_ITEM_WIDTH, { duration: 300, easing: Easing.out(Easing.quad) }); // Se puede animar el ancho si la píldora no es del mismo ancho que el ítem.
  }, [state.index, width, TAB_ITEM_WIDTH]); // Dependencias para re-ejecutar el efecto

  // Estilo animado para la píldora
  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: pillWidth.value, // El ancho de la píldora se anima con el mismo valor
      height: '100%', // Ocupa toda la altura disponible en el tab bar
      position: 'absolute', // Es crucial para que se mueva independientemente
      borderRadius: 25, // Bordes redondeados para la píldora
      backgroundColor: Colors.brand.lightBlue, // Color de la píldora
      // Ajuste de padding/margen si la píldora es más pequeña que el ítem del tab
      paddingHorizontal: 0,
    };
  });

  return (
    <View style={[styles.tabBarContainer, { width }]}>
      {/* La píldora animada se renderiza primero para que quede detrás de los iconos y textos */}
      <Animated.View style={pillAnimatedStyle} />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, { width: TAB_ITEM_WIDTH }]} // Asegura que cada ítem tenga el mismo ancho
          >
            {/* Contenido del ítem de la pestaña (ícono y texto) */}
            <IconSymbol
              name={options.tabBarIcon ? options.tabBarIcon({ color: Colors.brand.white }).props.name : 'questionmark.circle.fill'}
              color={isFocused ? Colors.brand.white : Colors.brand.gray} // El ícono siempre será blanco si está dentro de la píldora
              size={28}
            />
            {isFocused && (
              <Animated.Text style={styles.tabLabel}>
                {label}
              </Animated.Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />} // USAR NUESTRO CUSTOM TAB BAR
      screenOptions={{
        headerShown: false, // El layout padre ya proporciona un header
        // ELIMINAR PROPIEDADES DE tabBarStyle AQUÍ, YA QUE SERÁN MANEJADAS POR CustomTabBar
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol name="message.fill" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="Notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <IconSymbol name="bell.fill" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.brand.darkBlue,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden', // Importante para que la píldora animada se "corte" en los bordes redondeados
  },
  tabItem: {
    flex: 1, // Cada ítem ocupa el mismo espacio
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // Para que el ícono y el texto estén en la misma línea
    gap: 8, // Espacio entre ícono y texto
  },
  tabLabel: {
    color: Colors.brand.white, // El texto de la píldora debe ser blanco
    fontSize: 14,
    fontWeight: '600',
  },
});