import { motion } from 'framer-motion'
import type React from 'react'
import { useEffect, useState } from 'react'

import { BsCurrencyExchange } from 'react-icons/bs'
import { TbArrowsUpDown } from 'react-icons/tb'
import Analytics from '@/analytics'
import { Button } from '@/components/button/button'
import { SelectBox } from '@/components/selectbox/selectbox'
import { TextInput } from '@/components/text-input'
import { useGetCurrencyByCode } from '@/services/hooks/currency/getCurrencyByCode.hook'
import { useGetSupportCurrencies } from '@/services/hooks/currency/getSupportCurrencies.hook'

export const CurrencyConverter: React.FC = () => {
	const [fromCurrency, setFromCurrency] = useState<string>('EUR')
	const [toCurrency, setToCurrency] = useState<string>('USD')
	const [amount, setAmount] = useState<number>(1)
	const [convertedAmount, setConvertedAmount] = useState<number>(0)
	const [isSwapping, setIsSwapping] = useState<boolean>(false)

	const { data: supportedCurrencies, isLoading: isLoadingSupported } =
		useGetSupportCurrencies()

	const { data: fromCurrencyData, isLoading: isLoadingFrom } = useGetCurrencyByCode(
		fromCurrency,
		{ refetchInterval: null }
	)

	const { data: toCurrencyData, isLoading: isLoadingTo } = useGetCurrencyByCode(
		toCurrency,
		{ refetchInterval: null }
	)

	useEffect(() => {
		if (fromCurrencyData && toCurrencyData && amount) {
			const fromRialPrice = fromCurrencyData.rialPrice
			const toRialPrice = toCurrencyData.rialPrice

			if (fromRialPrice && toRialPrice) {
				const converted = (amount * fromRialPrice) / toRialPrice
				setConvertedAmount(Number(converted.toFixed(2)))
				Analytics.event(
					`currency_converter_convert_${fromCurrency}_to_${toCurrency}`
				)
			}
		}
	}, [fromCurrencyData, toCurrencyData, amount])

	const handleSwap = () => {
		setIsSwapping(true)
		const temp = fromCurrency
		setFromCurrency(toCurrency)
		setToCurrency(temp)

		setTimeout(() => setIsSwapping(false), 300)
		Analytics.event(`currency_converter_swap`)
	}

	const formatNumber = (num: number, currency?: string) => {
		const decimals = currency === 'IRT' || currency === 'IRR' ? 0 : 3
		return new Intl.NumberFormat('fa-IR', {
			maximumFractionDigits: decimals,
			minimumFractionDigits: decimals,
		}).format(num)
	}

	const getCurrencyDisplay = (currencyCode: string) => {
		const currency = supportedCurrencies?.find((c) => c.key === currencyCode)
		return {
			code: currencyCode,
			name: currency?.label.fa || currencyCode,
		}
	}

	if (isLoadingSupported) {
		return (
			<div className="flex flex-col items-center justify-center h-64 space-y-3">
				<div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
					<BsCurrencyExchange className="w-6 h-6 text-primary animate-pulse" />
				</div>
				<div className="loading loading-spinner loading-md"></div>
				<p className="text-sm text-content">بارگذاری ارزها...</p>
			</div>
		)
	}

	const fromDisplay = getCurrencyDisplay(fromCurrency)
	const toDisplay = getCurrencyDisplay(toCurrency)

	return (
		<div className="flex flex-col gap-1 p-0.5">
			<div className="flex items-center gap-2 p-1 transition-colors duration-200 border border-transparent rounded-2xl bg-content hover:bg-base-200 hover:border-base-300">
				<SelectBox
					options={supportedCurrencies?.map((c) => ({
						label: `${c.label.fa || c.key} - ${c.label.en || ''}`,
						value: c.key,
					}))}
					value={fromCurrency}
					onChange={(val) => setFromCurrency(val)}
					className="h-10 !rounded-2xl"
				/>
				<TextInput
					type="number"
					value={amount.toString()}
					onChange={(e) => setAmount(Number(e))}
					className="!rounded-2xl !px-4 border-content"
					min={0}
					placeholder="مبلغ"
				/>
			</div>

			<div className="flex justify-center">
				<Button
					size="xs"
					onClick={handleSwap}
					className="btn btn-ghost btn-sm btn-circle"
					disabled={isSwapping}
				>
					<motion.div
						animate={{ rotate: isSwapping ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<TbArrowsUpDown />
					</motion.div>
				</Button>
			</div>

			<div className="flex items-center gap-2 p-1 transition-colors duration-200 border border-transparent rounded-2xl bg-content">
				<SelectBox
					options={supportedCurrencies?.map((c) => ({
						label: `${c.label.fa || c.key} - ${c.label.en || ''}`,
						value: c.key,
					}))}
					value={toCurrency}
					onChange={(val) => setToCurrency(val)}
					className="h-10 !w-24 !rounded-2xl"
				/>
				<div className="w-32 text-lg font-medium text-right">
					{isLoadingFrom || isLoadingTo ? (
						<div className="flex items-center justify-center">
							<div className="loading loading-spinner loading-sm opacity-60"></div>
						</div>
					) : (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.2 }}
							className="font-bold text-content"
						>
							{formatNumber(convertedAmount, toCurrency)}
						</motion.div>
					)}
				</div>
			</div>

			<div className="p-1 bg-content rounded-2xl">
				<div className="mb-0.5 text-center">
					<div className="text-lg font-medium text-content">
						<div className="text-xs font-extrabold text-content">معادل</div>
						<span className="font-bold ">
							{fromCurrencyData && toCurrencyData
								? formatNumber(convertedAmount, toCurrency)
								: '...'}
						</span>
						<span className="text-xs font-bold text-content">
							{' '}
							{toDisplay.name}
						</span>
					</div>
				</div>

				<div className="border-t border-content">
					<div className="flex items-center justify-between p-0.5 rounded-lg bg-base-200/30">
						<span className="text-xs font-bold text-content">
							معادل تومان:
						</span>
						<span className="text-sm font-medium text-content">
							{fromCurrencyData && amount
								? formatNumber(fromCurrencyData.rialPrice * amount, 'IRT')
								: '0'}{' '}
							<span className="text-xs font-bold">تومان</span>
						</span>
					</div>

					<div className="grid grid-cols-1 gap-2">
						<div className="flex justify-between text-xs">
							<div className="flex-1 text-center rounded bg-base-200/20">
								<div className="font-bold text-content">
									۱ {fromDisplay.name}
								</div>
								<div className="font-medium text-content">
									{fromCurrencyData
										? formatNumber(fromCurrencyData.rialPrice, 'IRT')
										: '0'}{' '}
									تومان
								</div>
							</div>
							<div className="flex-1 text-center rounded bg-base-200/20">
								<div className="font-extrabold text-content">
									۱ {toDisplay.name}
								</div>
								<div className="font-medium text-content">
									{toCurrencyData
										? formatNumber(toCurrencyData.rialPrice, 'IRT')
										: '0'}{' '}
									تومان
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
