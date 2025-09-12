import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import Constants from 'expo-constants'
import * as Localization from 'expo-localization'
import * as Speech from 'expo-speech'
import * as SQLite from 'expo-sqlite'
import i18next from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

const ORANGE = '#F68E34'
const WHITE = '#FFFFFF'
const MUTED = '#64748B'

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
    db = SQLite.openDatabase('bel-turismo.db')
    db.transaction(tx=>{
      tx.executeSql('CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, type TEXT, title TEXT);')
    })
  },[])
}

function Section({ title, children }: { title: string; children?: React.ReactNode }){
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>{title}</Text>
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
    <View style={{ backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
      {image ? (
        <Image source={{ uri: image }} style={{ width: '100%', height: 140 }} />
      ) : (
        <View style={{ width: '100%', height: 140, backgroundColor: '#F8FAFC' }} />
      )}
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>{title}</Text>
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

function HomeScreen(){
  useDb()
  const { t } = useTranslation()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#0F172A' }}>{t('appName')}</Text>
        <View style={{ marginTop: 8, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 }}>
          <Text style={{ color: MUTED }}>BEL</Text>
          <Text style={{ marginTop: 4, color: '#0F172A', fontSize: 16 }}>
            {t('belWelcome')}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {['Comércio','Cultura','Praias','Roteiros','Mapa'].map(l=> <Chip key={l} label={l} />)}
          </View>
        </View>

        <Section title="Agora em destaque">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1,2,3].map(i=> (
              <View key={i} style={{ width: 260, marginRight: 12 }}>
                <Card title={`Evento ${i}`} subtitle="Hoje, 19:00" image={`https://picsum.photos/seed/event${i}/600/400`} />
              </View>
            ))}
          </ScrollView>
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
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>BEL</Text>
        <Text style={{ color: MUTED, marginTop: 6 }}>Toque e fale. Sugestões serão baseadas no horário e sua localização.</Text>
        <View style={{ marginTop: 16, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 }}>
          <Text style={{ color: '#0F172A', fontWeight: '700' }}>{t('suggestions')}</Text>
          {['Praias tranquilas agora','Roteiro histórico de 1 dia','Mercados artesanais por perto'].map(s=> (
            <Text key={s} style={{ marginTop: 8, color: MUTED }}>• {s}</Text>
          ))}
        </View>
        <TouchableOpacity onPress={()=> speak(t('belWelcome'))} style={{ alignSelf:'center', marginTop: 24, backgroundColor: ORANGE, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: WHITE, fontWeight: '800' }}>{t('speakToBEL')}</Text>
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
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="BEL" component={BELScreen} />
      <Tab.Screen name="Comércio" component={ComercioScreen} />
      <Tab.Screen name="Cultura" component={CulturaScreen} />
      <Tab.Screen name="Praias" component={PraiasScreen} />
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
