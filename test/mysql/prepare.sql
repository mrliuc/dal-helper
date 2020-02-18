drop table if exists TestTable;
###
CREATE TABLE TestTable (
  Id int(11) NOT NULL AUTO_INCREMENT,
  ColInt int(11) null,
  ColNvarchar varchar(50)  NULL,
  ColDateTime datetime null,
  ColFloat double null,
  PRIMARY KEY (Id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
###
drop table if exists Sequence;
###
CREATE TABLE Sequence(
	SequenceType varchar(50) NOT NULL,
	SequenceNo int(11) NOT NULL,
  PRIMARY KEY (SequenceType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
###
drop PROCEDURE if exists sp_GetSequenceNo;
###
CREATE PROCEDURE `sp_GetSequenceNo`(
in SeqType varchar(50),
in MinNo int(11) ,
in Step int(11),
in MaxNo int(11), 
out SeqNo int(11) )
leave_exit:begin	   

	if SeqType is null then
		set SeqNo=0;
		leave leave_exit;
    end if;
    
    if MinNo is null then 
		set MinNo=1;
    end if;
    
    if Step is null then 
		set Step=1;
    end if; 
    
    if MaxNo is null then 
		set MaxNo=9999;
    end if; 
       
	start transaction ;       
    select SequenceNo into SeqNo from Sequence where SequenceType=SeqType;
    
	if SeqNo is not null then        
        set SeqNo=SeqNo+Step;
		if SeqNo>MaxNo then
			set SeqNo=MinNo;	
		end if;
		update Sequence set SequenceNo=SeqNo  where SequenceType=SeqType ;
        
	else 
		set SeqNo=MinNo;
		insert Sequence(SequenceType,SequenceNo) values(SeqType,SeqNo);
	end if;
	commit;
  select SeqNo;
end;