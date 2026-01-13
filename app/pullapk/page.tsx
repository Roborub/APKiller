'use client';
import { ChangeEventHandler, useEffect, useState } from "react";

export default function PullApkSection() {
  const [devices, setDevices] = useState<string[]>([]);
  const [apps, setApps] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [appFilter, setAppFilter] = useState<string>("");
  const [filteredApps, setFilteredApps] = useState<string[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string>("Console Out -- changing tabs will clear output but won't stop the command.");

  const selectDevicePrompt = "-- Select Device --";

  useEffect(() => {
    function handlePullApkLog(data: string) {
      setConsoleOutput((prev) => prev + "\n" + data);
    }
    window.electronAPI.onPullApkLog(handlePullApkLog);
    getDevices();
  }, []);

  useEffect(() => {
    if (!selectedDevice || selectedDevice === selectDevicePrompt) {
      return;
    }
    getApps();
  }, [selectedDevice]);

  useEffect(() => {
    if (!!appFilter) {
      const filteredAppClones = apps.filter(a => a.includes(appFilter));
      setSelectedApp(filteredAppClones[0]);
      setFilteredApps(filteredAppClones);
    } else {
      setFilteredApps(apps);
    }
  }, [appFilter]);

  async function getApps() {
    const appResponse = await window.electronAPI.getApps(selectedDevice);

    if (!!appResponse && appResponse.length > 0) {
      setApps(appResponse);
      setFilteredApps(appResponse);
      setSelectedApp(appResponse[0]);
    }
  }

  async function getDevices() {
    const devicesResponse = await window.electronAPI.getDevices();

    if (!!devicesResponse && devicesResponse.length > 0) {
      setDevices(devicesResponse);
    }
  }

  function updateSelectedDevice(e: React.ChangeEvent<HTMLSelectElement>) {
    const device = e.target.value;

    if (!!device && devices.includes(device)) {
      setSelectedDevice(device);
    }
  }

  function onFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filter = e.target.value;

    if (!!filter) {
      setAppFilter(filter);
    }
  }

  function changeSelectedApp(e: React.ChangeEvent<HTMLSelectElement>) {
    const app = e.target.value;

    if (!app) {
      return;
    }

    setSelectedApp(app);
  }

  function pullApp() {
    if (!!selectedApp) {
      window.electronAPI.pullApk(selectedApp, selectedDevice);
    }
  }

  return (
    <div className="font-sans items-center justify-center gap-3 fixed top-15 right-3 left-3 bottom-3">
      <main className="h-full w-full grid grid-cols-1 gap-5 items-center sm:items-start top-15">
        <section className="flex h-full rounded-lg bg-secondary select-none">
          <div className="p-5 w-full">
            <div>
              <span className="block mb-5 font-bold">Pull APK</span>
              <div className="mb-3 grid grid-cols-3 gap-5">
                <span className="col-span-1 my-auto">Choose Device</span>
                <select onChange={updateSelectedDevice} className="bg-dark text-white p-1 rounded-lg cursor-pointer hover:bg-black">
                  {devices && devices.length > 0 && <option>{selectDevicePrompt}</option>}
                  {
                    (devices && devices.length > 0)
                      ? devices.map(d => <option key={d} className="text-center">
                        {d}
                      </option>)
                      : <option disabled className="text-center">-- NO DEVICES FOUND --</option>
                  }
                </select>
                <a onClick={getDevices} className="cursor-pointer hover:bg-white hover:text-black text-white bg-light p-5 rounded-lg text-center">Refresh Device List</a>
              </div>
            </div>
            <div>
              <span className="block mb-5 font-bold">Pull APK</span>
              <div className="mb-3 grid grid-cols-3 gap-5">
                <span className="col-span-1 my-auto">Apps</span>
                <select className="bg-dark text-white p-1 rounded-lg cursor-pointer hover:bg-black" onChange={changeSelectedApp}>
                  {
                    (!filteredApps || filteredApps.length <= 0)
                      ? <option className="text-left">-- Select a device to update list --</option>
                      : filteredApps.map(a => <option className="text-left" key={a} value={a}>{a}</option>)
                  }
                </select>
                <input type="text" placeholder="filter" className="bg-black text-white p-2 rounded-md" onChange={onFilterChange} />
                <a onClick={pullApp} className="col-start-2 cursor-pointer hover:bg-white hover:text-black text-white bg-light p-5 rounded-lg text-center">Pull Apk</a>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-5">
                <textarea className="w-full col-start-2 col-span-2 h-50 bg-black mt-5 p-2 text-xs overflow-y-scroll" value={consoleOutput} readOnly />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
