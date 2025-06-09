export default {
    name : "LotCard",
    props : ['lot_id', 'location_name', 'address', 'pincode', 'price', 'max_slot'],
    template : `
    <div class="container">
        <div class="row py-2 border-bottom"
            style="cursor: pointer; tab-size: 4, padding: 10"
            @click="$router.push('/lots/' + lot_id)" > 
            
                <strong>Lot Id: </strong> {{ lot_id }} &ensp;&ensp;
                <strong>Location: </strong> {{ location_name}} 
        </div>
    </div>
        
    `,

}