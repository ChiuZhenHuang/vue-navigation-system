<template>
  <v-card class="ma-2 pa-4">
    <div class="mb-4">
      <div class="mb-2">
        <Button
          block
          :loading="isLocating"
          :disabled="isLocating"
          @click="getCurrentLocation"
          class="orange-btn"
          prepend-icon="mdi-map-marker"
        >
          {{ isLocating ? '定位中...' : '定位我的位置' }}
        </Button>
      </div>

      <div class="mt-4">
        <TextField
          ref="searchInputRef"
          v-model="searchInput"
          placeholder="搜尋目的地"
          prepend-inner-icon="mdi-magnify"
          clearable
          variant="outlined"
          density="comfortable"
        />
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <div
          v-if="isLoaded"
          ref="mapContainer"
          style="width: 100%; height: 500px"
          class="rounded"
        ></div>
        <v-skeleton-loader v-else type="card" height="500" class="rounded"></v-skeleton-loader>
      </v-col>

      <v-col cols="12" md="4" v-if="routeInfo">
        <Card class="pa-4" elevation="4">
          <template #content>
            <div class="text-subtitle-1 mb-2">預估距離： {{ routeInfo.distance }}</div>
            <div class="text-subtitle-1 mb-4">預估時間： {{ routeInfo.duration }}</div>
          </template>
          <template #actions>
            <Button
              block
              @click="startNavigation"
              :disabled="!selectedPlace || !currentPosition"
              class="orange-btn"
              prepend-icon="mdi-navigation"
            >
              {{ isNavigating ? '導航中' : '開始導航' }}
            </Button>
          </template>
        </Card>
      </v-col>

      <v-col cols="12" md="4" v-else>
        <Card class="pa-4" disabled elevation="4">
          <template #actions>
            <Button block prepend-icon="mdi-navigation" label="請選擇導航地點及定位" />
          </template>
        </Card>
      </v-col>
    </v-row>
  </v-card>
  <ToastMessage />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { getCarTypes } from '@/services/firebaseService';
import { saveUserRecord } from '@/services/firebaseService';
import { getUserRecords } from '@/services/firebaseService';
import { getUsersData } from '@/services/firebaseService';
import { useMessageStore } from '@/stores/messageStore';
import { useUserRecordStore } from '@/stores/userRecordStore';
import { useUserStore } from '@/stores/userStore';
import ToastMessage from '../toastMessage.vue';
import type { CarTypes } from '@/types/carTypes';
import type { Action } from '@/types/recordType';
import Button from '@/components/ui/Button.vue';
import TextField from '@/components/ui/TextField.vue';
import Card from '@/components/ui/Card.vue';

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  selectCarType: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['loadingStatus']);

const totalCarTypes = ref<CarTypes[]>([]);

const messageStore = useMessageStore();
const userRecordStore = useUserRecordStore();
const userStore = useUserStore();
const selectedCar = computed(() => {
  if (!props.selectCarType) return null;
  const selectedCar = totalCarTypes.value.find(car => car.value === props.selectCarType);
  return selectedCar;
});

onMounted(async () => {
  await getUserRecords(props.userId);
  await getUsersData();
  const carTypes = await getCarTypes();
  totalCarTypes.value = carTypes;
});

// 定義狀態
const isLoaded = ref(false);
const currentPosition = ref<{ lat: number; lng: number } | null>(null); // 當前位置
const selectedPlace = ref<{ lat: number; lng: number } | null>(null); // 選擇的目的地
const map = ref<google.maps.Map | null>(null); // 地圖實例
const isLocating = ref(false); // 是否正在定位
const searchInput = ref(''); // 搜尋輸入
const routeInfo = ref<{ distance: string; duration: string } | null>(null); // 路線資訊
const directions = ref<google.maps.DirectionsResult | null>(null); // 路線
const isNavigating = ref(false); // 是否正在導航

// DOM refs
const searchInputRef = ref<any>(null);
const autoComplete = ref<google.maps.places.Autocomplete | null>(null);
const directionsService = ref<google.maps.DirectionsService | null>(null);
const directionsRenderer = ref<google.maps.DirectionsRenderer | null>(null);
const mapContainer = ref<HTMLElement | null>(null);

watch(isLoaded, newValue => {
  if (newValue) emit('loadingStatus', true);
});

// Google Maps API 加載器
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

// 初始化 Google Maps
onMounted(async () => {
  try {
    const google = await loader.load();
    isLoaded.value = true;

    // 在下一個 tick 確保 DOM 已經更新
    setTimeout(() => {
      initMap(google);
    }, 0);
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
    messageStore.show('無法載入 Google 地圖，請檢查您的網路連接', 'error', 3000);
  }
});

// 初始化地圖
const initMap = (google: any) => {
  // 建立地圖
  const defaultCenter = { lat: 25.0478, lng: 121.5319 };
  map.value = new google.maps.Map(mapContainer.value, {
    center: defaultCenter,
    zoom: 14,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  });

  // 初始化方向服務
  directionsService.value = new google.maps.DirectionsService();
  directionsRenderer.value = new google.maps.DirectionsRenderer({
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#4A90E2',
      strokeWeight: 5,
    },
  });

  directionsRenderer.value?.setMap(map.value);

  // 初始化地址自動完成
  setupAutocomplete();
};

// 設置地址自動完成功能
const setupAutocomplete = () => {
  if (!isLoaded.value || !searchInputRef.value) return;

  // 對於 Vuetify 的 v-text-field，要找到正確的 input 元素
  const input = searchInputRef.value.$el.querySelector('input');
  if (!input) return;

  input.setAttribute('autocomplete', 'new-password');

  autoComplete.value = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: 'tw' },
    fields: ['geometry', 'formatted_address', 'name'],
  });

  autoComplete.value.addListener('place_changed', () => {
    if (!autoComplete.value) return;
    const place = autoComplete.value.getPlace();
    if (place?.geometry?.location) {
      const pos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      selectedPlace.value = pos;
      if (map.value) {
        map.value.panTo(pos);
        map.value.setZoom(16);
      }
      searchInput.value = place.formatted_address || place.name || '';

      // 如果有當前位置，計算路線
      if (currentPosition.value) {
        calculateRoute(currentPosition.value, pos);
      }
    }
  });
};

// 監聽地圖和當前位置變化，更新自動完成
watch([map, currentPosition], () => {
  setupAutocomplete();
});

// 計算路線
const calculateRoute = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) => {
  if (!directionsService.value) return;

  directionsService.value.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directions.value = result;
        directionsRenderer.value!.setDirections(result); // 使用非空斷言

        const route = result.routes[0].legs[0];
        routeInfo.value = {
          distance: route.distance?.text || '',
          duration: route.duration?.text || '',
        };
      } else {
        messageStore.show('無法計算路線，請嘗試其他目的地', 'error', 3000);
      }
    }
  );
};

// 獲取當前位置
const getCurrentLocation = () => {
  isLocating.value = true;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        currentPosition.value = pos;
        if (map.value) {
          map.value.panTo(pos);
          map.value.setZoom(16);
        }
        isLocating.value = false;

        // 當前位置標記
        addMarker(pos, 'current');

        // 如果已有選定地點，重新計算路線
        if (selectedPlace.value) {
          calculateRoute(pos, selectedPlace.value);
        }

        // notification.show('已獲取您的當前位置', 'success', 3000);
      },
      error => {
        isLocating.value = false;
        messageStore.show(`無法取得您的位置: ${error.message}`, 'error', 3000);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    isLocating.value = false;
    messageStore.show('瀏覽器不支援位置服務', 'error', 3000);
  }
};

interface MarkerData {
  marker: google.maps.Marker;
  type: string;
}
// 添加標記
const markers = ref<MarkerData[]>([]);
const addMarker = (position: { lat: number; lng: number }, type: string) => {
  // 清除相同類型的標記
  markers.value = markers.value.filter(marker => marker.type !== type);

  // 當顯示路線時不需要標記
  if (directions.value) return;

  const iconUrl =
    type === 'current'
      ? 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48L3N2Zz4='
      : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==';

  const marker = new google.maps.Marker({
    position: position,
    map: map.value,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(30, 30),
    },
  });

  markers.value.push({ marker, type });
};

// 開始導航
const startNavigation = async () => {
  if (!selectedCar.value) {
    console.log('沒選車款');
    messageStore.show('請選擇車種', 'error', 3000);
    return;
  }

  if (currentPosition.value && selectedPlace.value) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentPosition.value.lat},${currentPosition.value.lng}&destination=${selectedPlace.value.lat},${selectedPlace.value.lng}&travelmode=driving`;
    window.open(url, '_blank');
    isNavigating.value = true;

    if (selectedCar.value) {
      try {
        const action = {
          place: searchInput.value,
          distance: String(routeInfo.value?.distance),
          time: String(routeInfo.value?.duration),
          carType: selectedCar.value.value ?? '未知車款',
          oil: selectedCar.value.oil ?? '未知',
        } as Action;

        const result = await saveUserRecord({
          userId: props.userId,
          action,
          timestamp: Date.now(),
        });
        if (result.success) {
          userRecordStore.getUserRecordApi(props.userId); // 再取一次使用者資料
          userStore.getUserDataApi(); // 再取一次所有資料
          messageStore.show('已儲存路線資料', 'success', 3000);
        } else {
          messageStore.show('儲存路線資料失敗', 'error', 3000);
        }
      } catch (error) {
        console.error('Error saving navigation data:', error);
      }
    } else {
      messageStore.show('請選擇車種', 'error', 3000);
    }
  }
};

// 監聽選定地點變化，添加標記
watch(selectedPlace, newPlace => {
  if (newPlace) {
    addMarker(newPlace, 'destination');
  }
});

// 監聽路線變化，移除標記
watch(directions, newDirections => {
  if (newDirections) {
    // 清除所有標記，因為路線會有自己的標記
    markers.value.forEach(({ marker }) => marker.setMap(null));
    markers.value = [];
  }
});

// 組件銷毀時清理資源
onUnmounted(() => {
  // 清除標記
  markers.value.forEach(({ marker }) => marker.setMap(null));

  // 移除地圖實例
  map.value = null;
  directionsRenderer.value = null;
  directionsService.value = null;
  autoComplete.value = null;
});
</script>

<style>
/* Google Places Autocomplete 下拉選單樣式 */
.pac-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  margin-top: 4px;
  font-family: inherit;
}

.pac-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  border-top: 1px solid #f5f5f5;
}

.pac-item:first-child {
  border-top: none;
}

.pac-item:hover {
  background-color: #f5f5f5;
}

.pac-item-query {
  font-size: 14px;
  color: #333;
}

.pac-matched {
  font-weight: bold;
  color: #f1ab40;
}

.pac-icon {
  margin-right: 8px;
}

/* 去除預設的黃色背景 */
.pac-item-selected,
.pac-item-selected:hover {
  background-color: #e3f2fd;
}

.orange-btn {
  background-color: #f1ab40;
  color: white;
  &:hover {
    opacity: 0.8;
  }
}
</style>
