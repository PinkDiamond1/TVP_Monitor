import { ChainData } from "./ChainData";
import { Settings } from "./Settings";
import { PendingNomination, TVP_Account } from "./Types";
import { Utility } from "./Utility";

export class ProxyMessage{

    private tvp_account:TVP_Account;
    private nominees:string[];

    public constructor(nom_data:PendingNomination){
        
        var temp_tvp = Settings.tvp_nominators.find(account=>account.controller==nom_data.nominator);
        
        if(temp_tvp==undefined){
            this.tvp_account = <TVP_Account>{};
        }else{
            this.tvp_account = temp_tvp;
        }
            
        if(nom_data.proxy_info.targets==undefined){
            this.nominees=[];
        }else{
            this.nominees = nom_data.proxy_info.targets;
        }
        

    }


    async generateNewString():Promise<string>{
        var output:string[]=[];
         
        output.push(`<p>The following (${this.nominees.length}) validators should be nominated by ${this.tvp_account.stash}`);
                                             
        await Utility.getCandidates().then(candidates=>{
            output.push("<ul>");    
                
                this.nominees.forEach(nominee=>{
                
                    var candidate_name=Utility.getName(candidates, nominee);

                    output.push(`<li>${candidate_name}</li>`);                        
                    
                });
             

                
            output.push("</ul>");
            
            
        });
        
        return output.join("");
    }

    async generateDuplicateString(previous_nominees:string[]){
        var output:string[]=[];      
        var difference = this.nominees.filter(item => previous_nominees.indexOf(item) < 0);
        var percentage_change = (((difference.length*1.0)/(this.nominees.length*1.0))*100.00).toFixed(2);

        let chain_data = ChainData.getInstance();
        var era = await chain_data.getCurrentEra();

        chain_data.getPrefix()==2 ? era++: era+=2;
        
      
        output.push(`<p>The following (${this.nominees.length}) validators should be nominated by ${this.tvp_account.stash} in <b>18</b> hrs.<br/>`);    
        output.push(`These validators should be active in era ${era}.<br/>`)
        output.push(`${percentage_change}% of the nominations changed.</p>`); 
        

        await Utility.getCandidates().then(candidates=>{
            output.push("<ul>");   
            previous_nominees.forEach(previous_nominee=>{
                
                var prev_candidate_name = Utility.getName(candidates,previous_nominee);
                //var prev_candidate_name = this.getName(candidates,previous_nominee);

                if(this.nominees.find(nominee=>nominee==previous_nominee)==undefined){
                    if(difference.length>0){

                        var new_candidate = difference.pop();
                        if(new_candidate!=undefined){
                            var new_candidate_name = Utility.getName(candidates,new_candidate);

                            output.push(`<li><del>${prev_candidate_name}</del> <b>-></b> <ins>${new_candidate_name }</ins></li>`);
                        }
                    }

                }else{
                    output.push(`<li>${prev_candidate_name}</li>`);                      
                }
                
    
            });

            output.push("</ul>");
        });


        return output.join("");
    }

}