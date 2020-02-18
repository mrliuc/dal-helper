IF OBJECT_ID (N'dbo.TestTable', N'U') IS NOT NULL 
BEGIN
 DROP TABLE [dbo].[TestTable]
END

CREATE TABLE [dbo].[TestTable](
		[Id] [int] IDENTITY(1,1) NOT NULL,
		[ColInt] [int] NULL,
		[ColNvarchar] [nvarchar](50) NULL,
		[ColDateTime] [datetime] NULL,
		[ColFloat] [float] NULL,
	CONSTRAINT [PK_TestTable] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]


IF OBJECT_ID (N'dbo.Sequence', N'U') IS NOT NULL 
BEGIN
 DROP TABLE [dbo].[Sequence]
END


CREATE TABLE [dbo].[Sequence](
	[SequenceType] [nvarchar](50) NOT NULL,
	[SequenceNo] [int] NOT NULL,
 CONSTRAINT [PK_Sequence] PRIMARY KEY CLUSTERED 
(
	[SequenceType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]


IF exists(SELECT * FROM sysobjects WHERE id=object_id(N'[master].[sp_GetSequenceNo]') and xtype='P')
begin
DROP proc sp_GetSequenceNo
end



if exists   (select   *   from   dbo.sysobjects   where   id   =   object_id(N'[dbo].sp_GetSequenceNo')   and   OBJECTPROPERTY(id,   N'IsProcedure')   =   1)  
begin
DROP procedure  sp_GetSequenceNo
end

###
CREATE proc [dbo].[sp_GetSequenceNo]
@SequenceType nvarchar(50),
@MinNo int =1,
@Step int=1,
@MaxNo int=9999, 
@SequenceNo int output
as
begin
if @SequenceType is null 
begin 
return;
end

SET NOCOUNT ON

begin tran T
if exists(select SequenceType from Sequence where SequenceType=@SequenceType  )
begin
	update Sequence set SequenceNo+=@Step,@SequenceNo=SequenceNo+@Step  where SequenceType=@SequenceType 
	if @SequenceNo>@MaxNo
	begin
		set @SequenceNo=@MinNo
		update Sequence set SequenceNo=@MinNo  where SequenceType=@SequenceType 
	end
end
else
begin
	set @SequenceNo=@MinNo
	insert Sequence(SequenceType,SequenceNo) values(@SequenceType,@MinNo)
end
Commit tran T
--return @SequenceNo
end





