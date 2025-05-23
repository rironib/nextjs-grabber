import {Atomic_Age, Hind_Siliguri, Poppins} from 'next/font/google'

export const atomic_age = Atomic_Age({
    subsets: ['latin'],
    display: 'swap',
    weight: '400'
})

export const poppins = Poppins({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600', '700'],
})