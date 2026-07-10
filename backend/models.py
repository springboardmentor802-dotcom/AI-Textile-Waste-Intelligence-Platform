class WasteInventory:
    def __init__(self, batch_id, fabric_type, source,
                 quantity, color, condition,
                 collection_date):

        self.batch_id = batch_id
        self.fabric_type = fabric_type
        self.source = source
        self.quantity = quantity
        self.color = color
        self.condition = condition
        self.collection_date = collection_date