<?php 

require_once __DIR__.'/../config.php';

class DB {
    private static $PDO = null;
    static public function getInstance(){
        if(is_null(self::$PDO)){
            try {
                self::$PDO = new PDO('mysql:dbname='.DB_NAME.';host='.DB_HOST, DB_USER, DB_PASSWORD);
                self::$PDO->exec('SET NAMES utf8;');
            } catch (PDOException $e) {
                self::$PDO = false;
            }
        }
        return self::$PDO;
    }
    static public function query($sql, $params = array()){
        $PDO = self::getInstance();
        if(!$PDO) return array();
        $sth = $PDO->prepare($sql);
        $rs = $sth->execute($params);       
        if($rs) return $sth->fetchAll();
        return array();
    }
    static public function update($sql, $params = array()){
        $PDO = self::getInstance();
        if(!$PDO) return array();
        $sth = $PDO->prepare($sql);
        $ok = $sth->execute($params);
        //if(!$ok) var_dump($sth->errorInfo());
        return $ok;
    }
    static public function lastInsertId(){
        $PDO = self::getInstance();
        if(!$PDO) return 0;
        return $PDO->lastInsertId();        
    }
}
