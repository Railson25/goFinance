import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useEffect, useState } from 'react'
import { HighlightCard } from '../../components/HighlightCard'
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard'
import {
    Container,
    Header, HighlightCards,
    Icon, LogoutButton, Photo,
    Title, Transaction, TransactionList,
    User,
    UserGreeating, UserInfo,
    UserName, UserWrapper
} from './styles'

export interface DataListProps extends TransactionCardProps {
    id: string
}

export function Dashboard() {
    const [data, setData] = useState<DataListProps[]>([])


    async function loadTransaction() {
        const dataKey = '@gofinaces:transactions'
        const response = await AsyncStorage.getItem(dataKey)
        const transactions = response ? JSON.parse(response) : []

        const transactionsFormated: DataListProps[] = transactions
            .map((item: DataListProps) => {
                const amount = Number(item.amount).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                const date = Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }).format(new Date(item.date));

                return {
                    id: item.id,
                    name: item.name,
                    amount,
                    type: item.type,
                    category: item.category,
                    date
                }
            })
        setData(transactionsFormated)
    }

    useEffect(() => {
        loadTransaction()
    }, [])

    return (
        <Container>
            <Header>
                <UserWrapper>
                    <UserInfo>
                        <Photo
                            source={{ uri: 'https://avatars.githubusercontent.com/u/47870113?v=4' }} />
                        <User>
                            <UserGreeating>Olá,</UserGreeating>
                            <UserName>Railson</UserName>
                        </User>
                    </UserInfo>
                    <LogoutButton onPress={() => { }}>
                        <Icon name="power" />
                    </LogoutButton>
                </UserWrapper>
            </Header>

            <HighlightCards>
                <HighlightCard
                    type='up'
                    title="Entradas"
                    amount="R$ 17.400,00"
                    lastTransaction="Última entrada dia 13 de abril"
                />
                <HighlightCard
                    type="down"
                    title="Saídas"
                    amount="R$ 1.259,00"
                    lastTransaction="Última saída dia 03 de abril"
                />
                <HighlightCard
                    type="total"
                    title="Total"
                    amount="R$ 16.141,00"
                    lastTransaction="01 à 16 de abril"
                />
            </HighlightCards>
            <Transaction>
                <Title>Listagem</Title>

                <TransactionList
                    data={data}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <TransactionCard data={item} />}
                />

            </Transaction>
        </Container>
    )
}
