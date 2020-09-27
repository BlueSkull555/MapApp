import Realm from 'realm';

export function getRealmApp() {
  const appId = 'mapapp-lxeqk';
  const appConfig = {
    id: appId,
    timeout: 10000,
  };

  return new Realm.App(appConfig);
}
