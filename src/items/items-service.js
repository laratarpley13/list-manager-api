const ItemsService = {
    getAllItems(knex, userId, listId) {
        return knex.from('items').select('*').where('userid', userId).andWhere('listid', listId)
    },
    insertItem(knex, newItem) {
        return knex
            .insert(newItem)
            .into('items')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, userId, listId, id) {
        return knex.from('items').select('*').where('userid', userId).andWhere('listid', listId).andWhere('id', id).first()
    },
    deleteItem(knex, userId, listId, id) {
        return knex('items')
            .where('userid', userId)
            .andWhere('listid', listId)
            .andWhere('id', id)
            .delete()
    },
    updateItem(knex, userId, listId, id, newItemFields) {
        return knex('items')
            .where('userid', userId)
            .andWhere('listid', listId)
            .andWhere('id', id)
            .update(newItemFields)
    }
}

module.exports = ItemsService