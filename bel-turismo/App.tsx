import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, TextInput } from 'react-native'
import Constants from 'expo-constants'
import * as Localization from 'expo-localization'
import * as Speech from 'expo-speech'
// SQLite: evitar import web (wasm). Carrega só em nativo
let SQLite: any = null as any
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SQLite = require('expo-sqlite')
}
import i18next from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

const ORANGE = '#F68E34'
const WHITE = '#FFFFFF'
const MUTED = '#64748B'
const LIGHT = '#F4F6F8'

// i18n setup (PT/EN)
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: Localization.getLocales()[0]?.languageCode === 'pt' ? 'pt' : 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: {
      appName: 'Bel Turismo',
      belWelcome: 'Welcome to Belmonte 🌞 What do you want to explore today?',
      speakToBEL: 'Talk to BEL',
      suggestions: 'Suggestions',
    }},
    pt: { translation: {
      appName: 'Bel Turismo',
      belWelcome: 'Bem-vindo a Belmonte 🌞 Quer descobrir praias, cultura ou comércio local hoje?',
      speakToBEL: 'Falar com a BEL',
      suggestions: 'Sugestões',
    }}
  }
})

// SQLite placeholder
type DB = SQLite.SQLiteDatabase
let db: DB | null = null
function useDb(){
  useEffect(()=>{
    if (Platform.OS !== 'web' && SQLite) {
      db = SQLite.openDatabase('bel-turismo.db')
      db.transaction((tx: any)=>{
        tx.executeSql('CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, type TEXT, title TEXT);')
      })
    }
  },[])
}

function Section({ title, children }: { title: string; children?: React.ReactNode }){
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  )
}

function Chip({ label }: { label: string }){
  return (
    <View style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: WHITE, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 }}>
      <Text style={{ color: '#0F172A', fontWeight: '600' }}>{label}</Text>
    </View>
  )
}

function Card({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }){
  return (
    <View style={{ backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECF0' }}>
      {image ? (
        <Image source={{ uri: image }} style={{ width: '100%', height: 160 }} />
      ) : (
        <View style={{ width: '100%', height: 160, backgroundColor: '#F8FAFC' }} />
      )}
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>{title}</Text>
        {subtitle ? <Text style={{ marginTop: 4, color: MUTED }}>{subtitle}</Text> : null}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <QuickButton label="Mapa" />
          <QuickButton label="WhatsApp" />
          <QuickButton label="Reservar" />
        </View>
      </View>
    </View>
  )
}

function QuickButton({ label }: { label: string }){
  return (
    <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 }}>
      <Text style={{ color: '#0F172A', fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  )
}

function SearchBar(){
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: LIGHT, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB' }}>
      <Text style={{ color: MUTED, marginRight: 8 }}>🔎</Text>
      <TextInput placeholder="Pesquise praias, cultura ou comércios locais" placeholderTextColor={MUTED} style={{ flex: 1, color: '#0F172A' }} />
    </View>
  )
}

function CategoryCard({ title, image }: { title: string; image: string }){
  return (
    <View style={{ width: 160, marginRight: 12 }}>
      <View style={{ backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECF0' }}>
        <Image source={{ uri: image }} style={{ width: '100%', height: 100 }} />
        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: '800', color: '#0F172A' }}>{title}</Text>
        </View>
      </View>
    </View>
  )
}

function HomeScreen(){
  useDb()
  const { t } = useTranslation()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#0F172A' }}>{t('appName')}</Text>

        <View style={{ marginTop: 14 }}>
          <SearchBar/>
        </View>

        <View style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECF0' }}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop' }} style={{ width: '100%', height: 180 }} />
        </View>

        <Section title="Explorar por categoria">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategoryCard title="Praias" image="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=800&auto=format&fit=crop"/>
            <CategoryCard title="Cultura" image="https://images.unsplash.com/photo-1523419410224-44e4832fc2bf?q=80&w=800&auto=format&fit=crop"/>
            <CategoryCard title="Comércio Local" image="https://images.unsplash.com/photo-1515165562835-c3b8c6b2a4d1?q=80&w=800&auto=format&fit=crop"/>
            <CategoryCard title="Experiências" image="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=800&auto=format&fit=crop"/>
          </ScrollView>
        </Section>

        <Section title="O que é tendência em Belmonte">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1,2,3].map(i=> (
              <View key={i} style={{ width: 280, marginRight: 12 }}>
                <Card title={`Em alta ${i}`} subtitle="Hoje" image={`https://picsum.photos/seed/trend${i}/600/420`} />
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section title="Próximo a você">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1,2].map(i=> (
              <View key={i} style={{ width: 280, marginRight: 12 }}>
                <Card title={`Perto ${i}`} subtitle="A 5 min" image={`https://picsum.photos/seed/near${i}/600/420`} />
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section title="Sugestões da BEL">
          <View style={{ backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: '#EAECF0', padding: 14 }}>
            <Text style={{ color: MUTED }}>BEL</Text>
            <Text style={{ marginTop: 4, color: '#0F172A', fontSize: 16 }}>{t('belWelcome')}</Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}

function BELScreen(){
  const { t } = useTranslation()
  const speak = (text: string) => Speech.speak(text, { language: i18next.language })
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>BEL</Text>
        <Text style={{ color: MUTED, marginTop: 6 }}>Toque e fale. Sugestões serão baseadas no horário e sua localização.</Text>
        <View style={{ marginTop: 16, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 }}>
          <Text style={{ color: '#0F172A', fontWeight: '700' }}>{t('suggestions')}</Text>
          {['Praias tranquilas agora','Roteiro histórico de 1 dia','Mercados artesanais por perto'].map(s=> (
            <Text key={s} style={{ marginTop: 8, color: MUTED }}>• {s}</Text>
          ))}
        </View>
        <TouchableOpacity onPress={()=> speak(t('belWelcome'))} style={{ position: 'absolute', right: 20, bottom: 24, backgroundColor: ORANGE, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}>
          <Text style={{ color: WHITE, fontWeight: '800' }}>🎤</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function ComercioScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>Comércio</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {['Gastronomia','Artesanato','Lojas','Experiências'].map(c=> <Chip key={c} label={c} />)}
        </View>
        <View style={{ marginTop: 16, gap: 12 }}>
          {[1,2,3].map(i=> <Card key={i} title={`Local ${i}`} subtitle="Aberto até 22h" image={`https://picsum.photos/seed/shop${i}/640/400`} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function CulturaScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>Cultura & Cidade</Text>
        <Text style={{ marginTop: 8, color: MUTED }}>História de Belmonte, destaques e eventos.</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          {[1,2,3].map(i=> <Card key={i} title={`Destaque ${i}`} subtitle="Evento cultural" image={`https://picsum.photos/seed/cultura${i}/640/400`} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function PraiasScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {[1,2,3,4].map(i=> (
          <Image key={i} source={{ uri: `https://picsum.photos/seed/praia${i}/900/600` }} style={{ width: '100%', height: 260 }} />
        ))}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>Praias</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {['Tranquilas','Família','Badaladas'].map(f=> <Chip key={f} label={f} />)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function MapaScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: MUTED }}>Mapa imersivo (placeholder)</Text>
      </View>
    </SafeAreaView>
  )
}

function FavoritesScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>Favoritos</Text>
        <Text style={{ marginTop: 8, color: MUTED }}>Salve locais e roteiros para acessar rapidamente offline.</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          {[1,2].map(i=> <Card key={i} title={`Favorito ${i}`} subtitle="Toque para abrir" image={`https://picsum.photos/seed/fav${i}/640/400`} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function RoteirosScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>Roteiros inteligentes</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          {[1,2,3].map(i=> <Card key={i} title={`Playlist ${i}`} subtitle="Arraste para personalizar" image={`https://picsum.photos/seed/roteiro${i}/640/400`} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function PerfilScreen(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>Perfil</Text>
        <Text style={{ marginTop: 8, color: MUTED }}>Histórico, conquistas e compartilhamento.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function Tabs(){
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: ORANGE }}>
      <Tab.Screen name="Explorar" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="BEL" component={BELScreen} />
    </Tab.Navigator>
  )
}

export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Mapa" component={MapaScreen} />
        <Stack.Screen name="Roteiros" component={RoteirosScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
