"use client"
import { Armchair, Building2, Car, Droplets, Flame, ShieldCheck, Snowflake, Wifi, Zap } from "lucide-react"

const inputCls = "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"
const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"
const errorCls = "mt-1 text-xs text-red-600 dark:text-red-400"

interface Props {
  hasGas: boolean | null; setHasGas: (v: boolean | null) => void;
  hasWater: boolean | null; setHasWater: (v: boolean | null) => void;
  hasElectricity: boolean | null; setHasElectricity: (v: boolean | null) => void;
  hasSewage: boolean | null; setHasSewage: (v: boolean | null) => void;
  parking: boolean; setParking: (v: boolean) => void;
  elevator: boolean; setElevator: (v: boolean) => void;
  furniture: boolean; setFurniture: (v: boolean) => void;
  wifi: boolean; setWifi: (v: boolean) => void;
  airConditioning: boolean; setAirConditioning: (v: boolean) => void;
  security: boolean; setSecurity: (v: boolean) => void;
  area: string; setArea: (v: string) => void;
  livingArea: string; setLivingArea: (v: string) => void;
  landArea: string; setLandArea: (v: string) => void;
  purpose: string; setPurpose: (v: string) => void;
  buildingType: string; setBuildingType: (v: string) => void;
  electricityPower: string; setElectricityPower: (v: string) => void;
  entrance: string; setEntrance: (v: string) => void;
  bathroom: string; setBathroom: (v: string) => void;
  deposit: string; setDeposit: (v: string) => void;
  utilitiesCondition: string; setUtilitiesCondition: (v: string) => void;
  renovation: string; setRenovation: (v: string) => void;
  isApartment: boolean; isHouse: boolean; isLand: boolean; isOffice: boolean; isRental: boolean;
  getFieldError: (name: string) => string;
  setTouchedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function Step1Features(props: Props) {
  const { getFieldError, setTouchedFields } = props;
  
  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Kommunal xizmatlar</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "hasGas", label: "Gaz", value: props.hasGas, setValue: props.setHasGas, Icon: Flame, required: true },
              { name: "hasWater", label: "Suv", value: props.hasWater, setValue: props.setHasWater, Icon: Droplets, required: true },
              { name: "hasElectricity", label: "Svet", value: props.hasElectricity, setValue: props.setHasElectricity, Icon: Zap, required: true },
            ].map(({ name, label, value, setValue, Icon, required }) => (
              <div key={name} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                  <Icon className="h-4 w-4 text-green-700" /> {label} {required && <span>*</span>}
                </div>
                <div role="group" className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
                  {[{ choice: true, text: "Bor" }, { choice: false, text: "Yo'q" }].map(({ choice, text }) => (
                    <button key={text} type="button" aria-pressed={value === choice} onClick={() => { setValue(choice); setTouchedFields(prev => ({ ...prev, [name]: true })) }}
                      className={`min-h-9 rounded-md px-2 text-xs font-semibold transition ${value === choice ? "bg-green-700 text-white" : "text-gray-600 hover:text-gray-900 dark:text-gray-300"}`}>
                      {text}
                    </button>
                  ))}
                </div>
                <input type="hidden" name={name} value={value === null ? "" : String(value)} />
                {getFieldError(name) && <p className={errorCls}>{getFieldError(name)}</p>}
              </div>
            ))}
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Droplets className="h-4 w-4 text-green-700" /> Kanalizatsiya
              </div>
              <div role="group" className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
                {[{ choice: true, text: "Bor" }, { choice: false, text: "Yo'q" }].map(({ choice, text }) => (
                  <button key={text} type="button" aria-pressed={props.hasSewage === choice} onClick={() => props.setHasSewage(props.hasSewage === choice ? null : choice)}
                    className={`min-h-9 rounded-md px-2 text-xs font-semibold transition ${props.hasSewage === choice ? "bg-green-700 text-white" : "text-gray-600 hover:text-gray-900 dark:text-gray-300"}`}>
                    {text}
                  </button>
                ))}
              </div>
              <input type="hidden" name="hasSewage" value={props.hasSewage === true ? "on" : props.hasSewage === false ? "off" : ""} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Qulayliklar</legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "furniture", label: "Mebel", checked: props.furniture, setChecked: props.setFurniture, Icon: Armchair },
              { name: "elevator", label: "Lift", checked: props.elevator, setChecked: props.setElevator, Icon: Building2 },
              { name: "parking", label: "Avtoturargoh", checked: props.parking, setChecked: props.setParking, Icon: Car },
              { name: "wifi", label: "Wi-Fi", checked: props.wifi, setChecked: props.setWifi, Icon: Wifi },
              { name: "airConditioning", label: "Konditsioner", checked: props.airConditioning, setChecked: props.setAirConditioning, Icon: Snowflake },
              { name: "security", label: "Xavfsizlik", checked: props.security, setChecked: props.setSecurity, Icon: ShieldCheck },
            ].map(({ name, label, checked, setChecked, Icon }) => (
              <label key={name} className="cursor-pointer">
                <input type="checkbox" name={name} checked={checked} onChange={(e) => setChecked(e.target.checked)} className="peer sr-only" />
                <span className="flex min-h-14 items-center justify-center gap-1 rounded-xl border border-gray-200 px-2 text-center text-xs font-semibold text-gray-600 transition peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white hover:border-emerald-500 dark:border-zinc-700 dark:text-gray-300">
                  <Icon className="h-4 w-4 shrink-0" /> {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <details className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800 dark:text-white">Maydon va qo&apos;shimcha ma&apos;lumotlar</summary>
        <div className="mt-4 space-y-3">
          {(props.isApartment || props.isHouse || props.isOffice) && (
            <div>
              <label htmlFor="area" className={labelCls}>{props.isHouse ? "Uy maydoni (m²)" : "Umumiy maydon (m²)"}</label>
              <input id="area" name="area" type="number" min={1} step="any" value={props.area} onChange={(e) => props.setArea(e.target.value)} className={inputCls} />
            </div>
          )}
          {props.isApartment && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="livingArea" className={labelCls}>Yashash maydoni (m²)</label>
                  <input id="livingArea" name="livingArea" type="number" min={1} step="any" value={props.livingArea} onChange={(e) => props.setLivingArea(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="bathroom" className={labelCls}>Sanuzel soni</label>
                  <input id="bathroom" name="bathroom" type="number" min={0} max={100} step={1} value={props.bathroom} onChange={(e) => props.setBathroom(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="renovation" className={labelCls}>Ta&apos;mir holati</label>
                <input id="renovation" name="renovation" maxLength={80} value={props.renovation} onChange={(e) => props.setRenovation(e.target.value)} placeholder="Masalan: Yevroremont" className={inputCls} />
              </div>
            </>
          )}
          {props.isLand && (
            <>
              <div>
                <label htmlFor="landArea" className={labelCls}>Yer maydoni (sotix)</label>
                <input id="landArea" name="landArea" type="number" min={0.01} step="any" value={props.landArea} onChange={(e) => props.setLandArea(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="purpose" className={labelCls}>Yer maqsadi</label>
                <input id="purpose" name="purpose" maxLength={100} value={props.purpose} onChange={(e) => props.setPurpose(e.target.value)} className={inputCls} />
              </div>
            </>
          )}
          {props.isOffice && (
            <>
              <div>
                <label htmlFor="buildingType" className={labelCls}>Bino turi</label>
                <input id="buildingType" name="buildingType" maxLength={100} value={props.buildingType} onChange={(e) => props.setBuildingType(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="electricityPower" className={labelCls}>Elektr quvvati (kW)</label>
                <input id="electricityPower" name="electricityPower" type="number" min={1} step={1} value={props.electricityPower} onChange={(e) => props.setElectricityPower(e.target.value)} className={inputCls} />
              </div>
            </>
          )}
          {props.isRental && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="deposit" className={labelCls}>Depozit summasi</label>
                <input id="deposit" name="deposit" type="number" min={0} step="any" value={props.deposit} onChange={(e) => props.setDeposit(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="utilitiesCondition" className={labelCls}>Kommunal sharti</label>
                <input id="utilitiesCondition" name="utilitiesCondition" maxLength={200} value={props.utilitiesCondition} onChange={(e) => props.setUtilitiesCondition(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  )
}