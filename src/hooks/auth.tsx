import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AplleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';



interface AuthProviderProps {
    children: ReactNode
}

interface User {
    id: string
    name: string
    email: string
    photo?: string
}

interface AuthContextData {
    user: User
    signInWithGoogle(): Promise<void>
    signInWithApple(): Promise<void>
    signOut(): Promise<void>
    userStorageLoading: boolean
}

interface AuthorizationResponse {
    params: {
        access_token: string
    }
    type: string
}


const AuthContext = createContext({} as AuthContextData)

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>({} as User)
    const [userStorageLoading, setUserStorageLoading] = useState(true)
    const userStorageKey = '@gofinances:user'


    async function signInWithGoogle() {
        console.log('ESTOU AQUUUUUUUUUUUUI')
        try {

            const CLIENT_ID = '583386505260-0nmqnck9ql07fild7jtaq5aah1t4hdjt.apps.googleusercontent.com';
            const REDIRECT_URI = 'https://auth.expo.io/@railsongoogle/gofinances';
            const RESPONSE_TYPE = 'token';
            const SCOPE = encodeURI('profile email');
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

            const { type, params } = await AuthSession
                .startAsync({ authUrl }) as AuthorizationResponse

            if (type === 'success') {
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`)
                const userInfo = await response.json()

                setUser({
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.given_name,
                    photo: userInfo.picture
                })
            }

        } catch (error) {
            throw new Error(error as string);
        }
    }

    async function signInWithApple() {
        try {
            const credential = await AplleAuthentication.signInAsync({
                requestedScopes: [
                    AplleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AplleAuthentication.AppleAuthenticationScope.EMAIL
                ]
            })
            if (credential) {
                const name = credential.fullName!.givenName!
                const photo = `https://ui-avatars.com/api/?name=${name}&length=1`
                const userLogged = {
                    id: String(credential.user),
                    email: credential.email!,
                    name,
                    photo
                }
                setUser(userLogged)
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))
            }


        } catch (error) {
            throw new Error(error as string)
        }
    }

    async function signOut() {
        setUser({} as User)
        await AsyncStorage.removeItem(userStorageKey)
    }

    useEffect(() => {
        async function loadUserStorageDate() {
            const userStoraged = await AsyncStorage.getItem(userStorageKey)

            if (userStoraged) {
                const userLogged = JSON.parse(userStoraged) as User
                setUser(userLogged)
            }
            setUserStorageLoading(false)
        }
        loadUserStorageDate()
    }, [])

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, signInWithApple, signOut, userStorageLoading }} >
            {children}
        </AuthContext.Provider>
    )
}


function useAuth() {
    const context = useContext(AuthContext)
    return context
}

export { AuthProvider, useAuth, };

