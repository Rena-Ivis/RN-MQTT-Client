import React, { useState, useEffect } from 'react';
import AwesomeMqtt from "react-native-awesome-mqtt";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { Input, Button, Text } from '@rneui/base';
import useStore from './store';

function App(): JSX.Element {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [MQTTClient, setMQTTClient] = useState<AwesomeMqtt>()
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState<string | object>('')
  const [user, setUser] = useState({
    clientId: '',
    username: '',
    password: '',
    uri: ''
  })

  const logs = useStore(({ logs }) => logs)
  const addLog = useStore(({ addLog }) => addLog)
  const onClean = useStore(({ clearLogs }) => clearLogs)

  const onConnect = () => {
    AwesomeMqtt.createClient({
      tls: false,
      ...user
    })
      .then((client: AwesomeMqtt) => {
        client.on('connect', () => {
          addLog({ type: 'Connected' })
          client.message.subscribe((message) => {
            addLog({ type: 'Message', message: JSON.stringify(message.message) })
          });
          client.subscribe('#', 2);
        });
        client.on('closed', () => {
          addLog({ type: 'Closed' })
        });
        client.on('error', (error) => {
          addLog({ type: 'Error', message: JSON.stringify(error) })
        });
        client.connect();
        setMQTTClient(client)
      });
  }

  const onDisconnect = () => {
    MQTTClient?.disconnect()
    addLog({ type: 'Disconnected' })
  }

  const onPublish = () => {
    MQTTClient?.publish(topic, message)
  }

  useEffect(() => {
    return () => {
      onDisconnect()
      onClean()
    }
  }, [])

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{fontSize: 20, marginBottom: isSettingsOpen ? 0 : 20}}>MQTT Settings</Text>
          <TouchableOpacity onPress={() => setIsSettingsOpen(!isSettingsOpen)}>
            {isSettingsOpen ? <Image source={require('./square-caret-up-regular.png')} style={{ width: 16, height: 16 }} /> : <Image source={require('./square-caret-down-regular.png')} style={{ width: 16, height: 16 }} />}
          </TouchableOpacity>
        </View>
        {isSettingsOpen && <>
          <Input
            placeholder="URL"
            onChangeText={value => setUser({ ...user, uri: value })}
          />
          <Input
            placeholder="ClientId"
            onChangeText={value => setUser({ ...user, clientId: value })}
          />
          <Input
            placeholder="Username"
            onChangeText={value => setUser({ ...user, username: value })}
          />
          <Input
            placeholder="Password"
            onChangeText={value => setUser({ ...user, password: value })}
          />
          <Button
            title={'Connect'}
            onPress={() => onConnect()}
          />
          <Button
            title={'Disconnect'}
            onPress={() => onDisconnect()}
            containerStyle={{ marginVertical: 20 }}
          />
        </>}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{fontSize: 20, marginBottom: isPublishOpen ? 0 : 20}}>MQTT Publish</Text>
          <TouchableOpacity onPress={() => setIsPublishOpen(!isPublishOpen)}>
            {isPublishOpen ? <Image source={require('./square-caret-up-regular.png')} style={{ width: 16, height: 16 }} /> : <Image source={require('./square-caret-down-regular.png')} style={{ width: 16, height: 16 }} />}
          </TouchableOpacity>
        </View>
        {isPublishOpen && <>
          <Input
            placeholder="Topic to publish"
            onChangeText={value => setTopic(value)}
          />
          <Input
            placeholder="Message to topic"
            onChangeText={value => setMessage(value)}
            multiline
          />
          <Button
            title={'Publish'}
            onPress={() => onPublish()}
            containerStyle={{ marginBottom: 20 }}
          />
        </>}
        <Button
          title={'Clear'}
          onPress={() => onClean()}
          containerStyle={{ marginBottom: 20 }}
        />
        <ScrollView
          horizontal
          contentContainerStyle={{ maxWidth: '100%' }}
        >
          <FlatList
            data={logs}
            extraData={logs.length}
            inverted
            renderItem={({ item }) =>
              <>
                <Text>{item.message ?? 'Success'}</Text>
                <Text style={{ color: 'orange' }}>{item.type}:</Text>
              </>
            }
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
