const { getById } = require("../users/users-service")

const ListsService = {
    getAllLists(knex, userid) {
        return knex.from('lists').select('*').where('userid', userid)
    },
    insertList(knex, newList) {
        return knex
            .insert(newList)
            .into('lists')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, userId, id) {
        return knex.from('lists').select('*').where('userid', userId).andWhere('id', id).first()
    },
    deleteList(knex, userId, id) {
        return knex('lists')
            .where('userid', userId)
            .andWhere('id', id)
            .delete()
    },
    updateList(knex, userId, id, newListFields) {
        return knex('lists')
            .where('userid', userId)
            .andWhere('id', id)
            .update(newListFields)
    }
}

module.exports = ListsService