const graphql = require('graphql');
const _=require('lodash');
const axios = require('axios');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

var users = [
    {firstName: 'Lam Duong 1', id:'1',age: 22},
    {firstName: 'Lam Duong 2', id:'2', age:33},
    {firstName: 'Lam Duong 3', id:'3', age:10},
    {firstName: 'Lam Duong 4', id:'4', age:15},
    {firstName: 'Lam Duong 5', id:'5', age:45},
]

const CompanyType = new GraphQLObjectType({
    name:'Company',
    fields: () =>({
        id:{type: GraphQLString},
        name:{type: GraphQLString},
        description:{type: GraphQLString},
        users:{
            type: new GraphQLList(UserType),
            resolve(parent,args){
                return axios.get(`http://localhost:3000/companies/${parent.id}/users`)
                .then(res => res.data)
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields:()=>({
        id:{type: GraphQLString},
        firstName:{type: GraphQLString},
        age:{type: GraphQLInt},
        company:{
            type: CompanyType,
            resolve(parent,args){
                return axios.get(`http://localhost:3000/companies/${parent.companyId}`)
                .then(res => res.data)
            }
        }
    })
})


const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields:{
        user:{
            type:UserType,
            args:{id: { type: GraphQLString } },
            resolve(parent, args){
                return axios.get(`http://localhost:3000/users/${args.id}`)
                .then(response => response.data)
            }
        },
        company:{
            type: CompanyType,
            args:{id: {type: GraphQLString}},
            resolve(parent,args){
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(res => res.data)
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields:{
        addUser:{
            type :UserType,
            args:{
                firstName:{type: new GraphQLNonNull(GraphQLString)},
                age:{type: new GraphQLNonNull(GraphQLInt)},
                companyId:{type: GraphQLString}
            },
            resolve(parent,args){
                return axios.post('http://localhost:3000/users',{firstName:args.firstName, age: args.age})
                .then(res => res.data)
            }
        },
        deleteUser:{
            type: UserType,
            args:{id:{type: new GraphQLNonNull(GraphQLString)}},
            resolve(parent,args){
                return axios.delete(`http://localhost:3000/users/${args.id}`)
                .then(res => res.data)
            }
        },
        updateUser:{
            type: UserType,
            args:{
                id:{type: new GraphQLNonNull(GraphQLString)},
                firstName:{type: GraphQLString},
                age:{type: GraphQLInt},
                companyId:{type: GraphQLString}
            },
            resolve(parent,args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`,args)
                .then(res => res.data)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})