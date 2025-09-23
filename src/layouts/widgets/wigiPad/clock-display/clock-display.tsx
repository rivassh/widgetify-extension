import { useEffect, useState } from 'react'
import { FaCog } from 'react-icons/fa'
import { getFromStorage } from '@/common/storage'
import { callEvent, listenEvent } from '@/common/utils/call-event'
import { Button } from '@/components/button/button'
import { useGeneralSetting } from '@/context/general-setting.context'
import { WidgetTabKeys } from '@/layouts/widgets-settings/constant/tab-keys'
import { type ClockSettings, ClockType } from './clock-setting.interface'
import { AnalogClock } from './clocks/analog.clock'
import { DigitalClock } from './clocks/digital.clock'

export function ClockDisplay() {
	const [clockSettings, setClockSettings] = useState<ClockSettings | null>(null)
	const { selected_timezone: timezone } = useGeneralSetting()

	useEffect(() => {
		async function load() {
			const clockFromStore = await getFromStorage('clock')
			if (clockFromStore) {
				setClockSettings(clockFromStore)
			} else {
				setClockSettings({
					clockType: ClockType.Digital,
					showSeconds: true,
					showTimeZone: true,
					useSelectedFont: true,
				})
			}
		}

		const event = listenEvent('wigiPadClockSettingsChanged', (data) => {
			setClockSettings({
				clockType: data.clockType,
				showSeconds: data.showSeconds,
				showTimeZone: data.showTimeZone,
				useSelectedFont: data.useSelectedFont,
			})
		})

		load()

		return () => {
			event()
		}
	}, [])

	if (!clockSettings) {
		return null
	}

	function onClickSettings() {
		callEvent('openWidgetsSettings', { tab: WidgetTabKeys.wigiPad })
	}

	return (
		<div className="relative flex flex-col items-center justify-center p-1 overflow-hidden">
			<div className="absolute inset-0 z-20 group">
				<Button
					size="xs"
					className="m-1.5 h-5 w-5 p-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 !border-none !shadow-none transition-all duration-300 delay-200"
					onClick={onClickSettings}
				>
					<FaCog size={12} className="text-content" />
				</Button>
			</div>

			<div className="flex flex-col items-center justify-center flex-grow">
				{clockSettings.clockType === 'analog' ? (
					<AnalogClock timezone={timezone} setting={clockSettings} />
				) : (
					<DigitalClock timezone={timezone} setting={clockSettings} />
				)}
			</div>
		</div>
	)
}
